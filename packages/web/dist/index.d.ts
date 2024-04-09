import BatchReporter, { CoreConfig } from "@bennowu/batch-reporter-core";
import { DataHandler, DataLoader } from "@bennowu/batch-reporter-types";
export interface WebConfig<T> {
    dumpKey: string;
    dumpFormatter?: DataHandler<T, string>;
    loadFormatter?: DataLoader<T[]>;
    enableLastSync?: boolean;
    beaconUrl: string;
    beaconTransform?: (data: T) => Parameters<typeof navigator.sendBeacon>[1];
}
export declare class WebBatchReporter<T> extends BatchReporter<T> {
    webConfig: Required<WebConfig<T>>;
    constructor(config: Omit<WebConfig<T> & CoreConfig<T>, 'sendBeacon' | 'setInterval'>);
}
export default WebBatchReporter;
