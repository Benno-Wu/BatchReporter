import puppeteer, { Browser, Page } from "puppeteer-core"
import { getEdgePath } from "edge-paths"
import fs from "fs"
import { resolve } from "path"
import { jest, beforeAll, afterAll, } from '@jest/globals';

const cwd = process.cwd()
// const timeout = 10 * 60 * 1000
const timeout = 30 * 1000
jest.setTimeout(timeout)

beforeAll(async () => {
    let browser: Browser, blankPage: Page, testPage: Page
    browser = await puppeteer.launch({
        headless: true,
        // headless: false,
        devtools: true,
        executablePath: getEdgePath()
    })
    blankPage = await browser.newPage()
    testPage = await browser.newPage()
    global.browser = browser
    global.blankPage = blankPage
    global.testPage = testPage

    testPage.on('console', msg => {
        console.log(`${msg.type()}: ${msg.text()}`)
    })
    testPage.on('pageerror', _ => { console.log('error: ', _) })
    // default page is about:blank, localStorage is not available
    await testPage.goto('https://benno-wu.github.io/SimplifiedFetch/')
    await testPage.addScriptTag({ content: fs.readFileSync(resolve(cwd, `./src/index.web.js`)).toString(), })
})

afterAll(async () => {
    const { browser, testPage } = global
    // await testPage.waitForNavigation({
    //     timeout
    // })
    await browser.close()
})
