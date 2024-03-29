"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebBatchReporter = void 0;
const batch_reporter_core_1 = __importDefault(require("@bennowu/batch-reporter-core"));
const DefaultWebConfig = {
    enableLastSync: true,
    dumpFormatter: (data) => {
        return JSON.stringify(data);
    },
    loadFormatter: (data) => {
        return JSON.parse(data);
    },
    beaconTransform: data => data,
};
class WebBatchReporter extends batch_reporter_core_1.default {
    constructor(config) {
        const webConfig = Object.assign(DefaultWebConfig, config);
        super({
            request: webConfig.request,
            sendBeacon: (data) => {
                return navigator.sendBeacon(webConfig.beaconUrl, webConfig.beaconTransform(data));
            },
            setInterval: globalThis.setInterval,
        });
        this.webConfig = DefaultWebConfig;
        this.webConfig = webConfig;
        if (config.enableLastSync) {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.lastChanceToSync();
                }
            });
        }
        this.hooks.dump.tapPromise('webDump', (data) => __awaiter(this, void 0, void 0, function* () {
            if (!localStorage)
                return false;
            try {
                localStorage.setItem(this.webConfig.dumpKey, this.webConfig.dumpFormatter(data));
                return true;
            }
            catch (error) {
                this.optionalHooks.onError.call(error);
                return false;
            }
        }));
        this.hooks.load.tapPromise('webLoad', () => {
            var _a;
            if (!localStorage)
                throw new Error('[web] localStorage is not supported');
            return this.webConfig.loadFormatter((_a = localStorage.getItem(this.webConfig.dumpKey)) !== null && _a !== void 0 ? _a : '[]');
        });
    }
}
exports.WebBatchReporter = WebBatchReporter;
exports.default = WebBatchReporter;
