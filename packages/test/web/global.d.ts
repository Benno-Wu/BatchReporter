import type { Browser, Page } from "puppeteer-core"
import { WebBatchReporter } from "@bennowu/batch-reporter-web";
import "typescript/lib/lib.dom";

declare global {
    var browser: Browser
    var blankPage: Page
    var testPage: Page
    var sleep: (time?: number) => Promise<void>
    var WebBatchReporter: WebBatchReporter
    var reporter: WebBatchReporter
    var originSetInterval: setInterval
    var originSendBeacon: Navigator['sendBeacon']
    var originSetItem: Storage['setItem']
}
