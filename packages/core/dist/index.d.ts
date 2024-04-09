/// <reference path="../tapable.d.ts" />
import { AsyncSeriesWaterfallHook, SyncHook } from "tapable";
import { unknownFunction, AsyncDataHandler, DataHandler } from "@bennowu/batch-reporter-types";
export interface CoreConfig<data> {
    autostart?: boolean;
    retry?: number;
    request: AsyncDataHandler<data>;
    sendBeacon: DataHandler<data>;
    delay?: number;
    setInterval: (interval: unknownFunction, delay?: number) => void;
}
export declare abstract class BatchReporter<data> {
    #private;
    private cache;
    private retryCount;
    config: Required<CoreConfig<data>>;
    constructor(config: CoreConfig<data>);
    hooks: {
        dump: AsyncSeriesWaterfallHook<[data[]], boolean, import("tapable").UnsetAdditionalOptions>;
        load: AsyncSeriesWaterfallHook<"never", data[], import("tapable").UnsetAdditionalOptions>;
    };
    optionalHooks: {
        onLoadEnd: SyncHook<void, void, import("tapable").UnsetAdditionalOptions>;
        onPushEnd: SyncHook<void, void, import("tapable").UnsetAdditionalOptions>;
        onLoadFail: SyncHook<unknown, void, import("tapable").UnsetAdditionalOptions>;
        onDumpFail: SyncHook<[data[]], void, import("tapable").UnsetAdditionalOptions>;
        onLastSyncFail: SyncHook<[data[]], void, import("tapable").UnsetAdditionalOptions>;
        onError: SyncHook<unknown, void, import("tapable").UnsetAdditionalOptions>;
    };
    protected lastChanceToSync: () => void;
    protected load: () => Promise<void>;
    start: () => void;
    push: (data: data) => void;
    private tryDump;
    private intervalRequest;
}
export default BatchReporter;
