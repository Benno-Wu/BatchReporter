import { AsyncSeriesWaterfallHook, SyncHook } from "tapable";
import { unknownFunction, AsyncDataHandler, DataHandler, PickByNullableKeys } from "@bennowu/batch-reporter-types";

export interface CoreConfig<data> {
    autostart?: boolean,
    retry?: number,

    request: AsyncDataHandler<data>,
    sendBeacon: DataHandler<data>,

    delay?: number,
    setInterval: (interval: unknownFunction, delay?: number) => void,
}

const DefaultCoreConfig: PickByNullableKeys<CoreConfig<unknown>> = { autostart: false, retry: 3, delay: 3000 }

export abstract class BatchReporter<data> {
    private cache: data[] = []
    private retryCount = 0
    public config: Required<CoreConfig<data>> = DefaultCoreConfig as Required<CoreConfig<data>>

    constructor(config: CoreConfig<data>) {
        this.config = Object.assign(DefaultCoreConfig, config)
        if (this.config.autostart) {
            this.start()
        }
    }

    hooks = {
        dump: new AsyncSeriesWaterfallHook<[data[]], boolean>(['data']),
        load: new AsyncSeriesWaterfallHook<'never', data[]>(['never']),
    }
    optionalHooks = {
        onLoadEnd: new SyncHook<void>(),
        onPushEnd: new SyncHook<void>(),
        onLoadFail: new SyncHook<unknown>(['error']),
        onDumpFail: new SyncHook<[data[]]>(['data']),
        onLastSyncFail: new SyncHook<[data[]]>(['data']),
        onError: new SyncHook<unknown>(['error'])
    }

    protected lastChanceToSync = () => {
        const result = this.config.sendBeacon(this.cache)
        if (result) {
            this.cache = []
            this.tryDump()
        } else {
            this.optionalHooks.onLastSyncFail.call(this.cache)
        }
    }

    protected load = async () => {
        let load: data[] = [];
        try {
            load = await this.hooks.load.promise('never')
            this.optionalHooks.onLoadEnd.call()
        } catch (error) {
            this.optionalHooks.onLoadFail.call(error)
            this.optionalHooks.onError.call(error)
        }
        this.cache.push(...load)
    }

    start = () => {
        this.config.setInterval(this.intervalRequest, this.config.delay)
    }
    #pause = () => {
        // todo unnecessary
    }
    push = (data: data) => {
        this.cache.push(data)
        this.tryDump()
        this.optionalHooks.onPushEnd.call()
    }

    private tryDump: () => Promise<boolean> = async () => {
        if (this.retryCount >= this.config.retry) {
            this.optionalHooks.onDumpFail.call(this.cache)
            this.retryCount = 0
            return false
        }
        const result = await this.hooks.dump.promise(this.cache)
        if (result) {
            this.retryCount = 0
            return true
        } else {
            this.retryCount++
            return this.tryDump()
        }
    }

    private intervalRequest = async () => {
        try {
            if (this.cache.length === 0) return;
            const result = await this.config.request(this.cache)
            if (result) {
                this.cache = []
                this.tryDump()
            } else {
                throw new Error('[core] intervalRequest fail')
            }
        } catch (error) {
            this.optionalHooks.onError.call(error)
        }
    }
}

export default BatchReporter