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
var _BatchReporter_pause;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchReporter = void 0;
const tapable_1 = require("tapable");
const DefaultCoreConfig = { autostart: false, retry: 3, delay: 3000 };
class BatchReporter {
    constructor(config) {
        this.cache = [];
        this.retryCount = 0;
        this.config = DefaultCoreConfig;
        this.hooks = {
            dump: new tapable_1.AsyncSeriesWaterfallHook(['data']),
            load: new tapable_1.AsyncSeriesWaterfallHook(),
        };
        this.optionalHooks = {
            onLoadEnd: new tapable_1.SyncHook(),
            onPushEnd: new tapable_1.SyncHook(),
            onLoadFail: new tapable_1.SyncHook(['error']),
            onDumpFail: new tapable_1.SyncHook(['data']),
            onLastSyncFail: new tapable_1.SyncHook(['data']),
            onError: new tapable_1.SyncHook(['error'])
        };
        this.lastChanceToSync = () => {
            const result = this.config.sendBeacon(this.cache);
            if (result) {
                this.cache = [];
                this.tryDump();
            }
            else {
                this.optionalHooks.onLastSyncFail.call(this.cache);
            }
        };
        this.start = () => __awaiter(this, void 0, void 0, function* () {
            let load = [];
            try {
                load = yield this.hooks.load.promise();
                this.optionalHooks.onLoadEnd.call();
            }
            catch (error) {
                this.optionalHooks.onLoadFail.call(error);
                this.optionalHooks.onError.call(error);
                return false;
            }
            this.cache.push(...load);
            this.config.setInterval(this.intervalRequest, this.config.delay);
            return true;
        });
        _BatchReporter_pause.set(this, () => {
            // todo unnecessary
        });
        this.push = (data) => {
            this.cache.push(data);
            this.tryDump();
            this.optionalHooks.onPushEnd.call();
        };
        this.tryDump = () => __awaiter(this, void 0, void 0, function* () {
            if (this.retryCount >= this.config.retry) {
                this.optionalHooks.onDumpFail.call(this.cache);
                this.retryCount = 0;
                return false;
            }
            const result = yield this.hooks.dump.promise(this.cache);
            if (result) {
                this.retryCount = 0;
                return true;
            }
            else {
                this.retryCount++;
                return this.tryDump();
            }
        });
        this.intervalRequest = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.cache.length === 0)
                    return;
                const result = yield this.config.request(this.cache);
                if (result) {
                    this.cache = [];
                    this.tryDump();
                }
                else {
                    throw new Error('[core] intervalRequest fail');
                }
            }
            catch (error) {
                this.optionalHooks.onError.call(error);
            }
        });
        this.config = Object.assign(DefaultCoreConfig, config);
        if (this.config.autostart) {
            this.start();
        }
    }
}
exports.BatchReporter = BatchReporter;
_BatchReporter_pause = new WeakMap();
exports.default = BatchReporter;
