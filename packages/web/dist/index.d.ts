import BatchReporter, { CoreConfig } from "@bennowu/batch-reporter-core";
import { DataHandler, DataLoader } from "@bennowu/batch-reporter-types";
export interface WebConfig<T> {
    request: CoreConfig<T>['request'];
    dumpKey: string;
    dumpFormatter?: DataHandler<T, string>;
    loadFormatter?: DataLoader<T[]>;
    enableLastSync?: boolean;
    beaconUrl: string;
    beaconTransform?: (data: T) => Parameters<typeof navigator.sendBeacon>[1];
}
export declare class WebBatchReporter<T> extends BatchReporter<T> {
    webConfig: Required<WebConfig<T>>;
    constructor(config: WebConfig<T>);
}
export default WebBatchReporter;
