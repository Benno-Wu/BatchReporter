import BatchReporter, { CoreConfig } from "@bennowu/batch-reporter-core";
import { DataHandler, DataLoader, PickByNullableKeys } from "@bennowu/batch-reporter-types";

export interface WebConfig<T> {
    dumpKey: string,
    dumpFormatter?: DataHandler<T, string>,
    loadFormatter?: DataLoader<T[]>,

    enableLastSync?: boolean,
    beaconUrl: string,
    beaconTransform?: (data: T) => Parameters<typeof navigator.sendBeacon>[1]
}

const DefaultWebConfig: PickByNullableKeys<WebConfig<unknown>> = {
    enableLastSync: true,

    dumpFormatter: (data) => {
        return JSON.stringify(data);
    },
    loadFormatter: (data) => {
        return JSON.parse(data);
    },

    beaconTransform: data => data as BodyInit,
}

export class WebBatchReporter<T> extends BatchReporter<T> {
    public webConfig: Required<WebConfig<T>> = DefaultWebConfig as Required<WebConfig<T>>

    constructor(config: Omit<WebConfig<T> & CoreConfig<T>, 'sendBeacon' | 'setInterval'>) {
        const webConfig = Object.assign(DefaultWebConfig, config)
        super({
            ...config,
            sendBeacon: (data) => {
                return navigator.sendBeacon(webConfig.beaconUrl, webConfig.beaconTransform(data))
            },
            setInterval: globalThis.setInterval,
        })
        this.webConfig = webConfig

        if (this.webConfig.enableLastSync) {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.lastChanceToSync()
                }
            })
        }

        this.hooks.dump.tapPromise('webDump', async (data) => {
            if (!localStorage) return false
            try {
                localStorage.setItem(this.webConfig.dumpKey, this.webConfig.dumpFormatter(data))
                return true
            } catch (error) {
                this.optionalHooks.onError.call(error)
                return false
            }
        })

        this.hooks.load.tap('webLoad', () => {
            if (!localStorage) throw new Error('[web] localStorage is not supported')
            return this.webConfig.loadFormatter(localStorage.getItem(this.webConfig.dumpKey) ?? '[]')
        })

        this.load()
    }
}

export default WebBatchReporter