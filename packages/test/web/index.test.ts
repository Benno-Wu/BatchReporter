import { beforeAll, describe, expect, jest, test } from '@jest/globals'

const packageName = '@bennowu/batch-reporter-web'
const exportName = 'WebBatchReporter'
const fakeURL = 'https://localhost:8888'

const emptyFunc = jest.fn()
const fakeRequest = jest.fn()
const fakeSendBeacon = jest.fn()
const fakeSetInterval = jest.fn()
const testObj = { test: 'test' }

beforeAll(async () => {
    // init browser-test-env
    await testPage.exposeFunction('emptyFunc', emptyFunc)
    await testPage.exposeFunction('fakeRequest', fakeRequest)
    await testPage.exposeFunction('fakeSendBeacon', fakeSendBeacon)
    await testPage.exposeFunction('fakeSetInterval', fakeSetInterval)
    await testPage.evaluate(async (fakeURL) => {
        globalThis.originSetItem = localStorage.setItem.bind(localStorage)

        globalThis.originSendBeacon = navigator.sendBeacon
        navigator.sendBeacon = fakeSendBeacon
        navigator.sendBeacon(fakeURL, [])

        globalThis.originSetInterval = globalThis.setInterval
        globalThis.setInterval = (fn, delay) => {
            fakeSetInterval(fn, delay)
            return originSetInterval(fn, delay)
        }
        const id = setInterval(emptyFunc, 10)
        setTimeout(() => {
            clearInterval(id)
        }, 25);
        globalThis.sleep = async (time = 50) => new Promise((res) => {
            setTimeout(res, time);
        })
        await sleep()
    }, fakeURL)
})

describe('batch-reporter-web Base Test', () => {
    test('export class correctly', async () => {
        const _ = await testPage.evaluate(async ([packageName, exportName]) => {
            // @ts-expect-error todo how to define this
            const pkg = globalThis[packageName]
            return [typeof pkg.default, typeof pkg[exportName], pkg.default === pkg[exportName]]
        }, [packageName, exportName])
        expect(_).toEqual(['function', 'function', true])
    })
    test('check test-env, expose reporter on window & new', async () => {
        expect(fakeSendBeacon).toHaveBeenCalledTimes(1)
        expect(fakeSendBeacon).toHaveBeenLastCalledWith(fakeURL, [])
        fakeSendBeacon.mockClear()
        expect(fakeSetInterval).toHaveBeenCalledTimes(1)
        // mock function can't be serialize
        // expect(fakeSetInterval).toHaveBeenLastCalledWith(emptyFunc, 10)
        expect(fakeSetInterval).toHaveBeenLastCalledWith(null, 10)
        fakeSetInterval.mockClear()
        expect(emptyFunc).toHaveBeenCalledTimes(2)
        emptyFunc.mockClear()

        const _ = await testPage.evaluate(async ([packageName, exportName, fakeURL]) => {
            const pkg = globalThis[packageName]
            globalThis[exportName] = pkg[exportName]
            const reporter = new WebBatchReporter({
                request: fakeRequest,
                dumpKey: exportName,
                beaconUrl: fakeURL,
                delay: 100,
            })
            globalThis.reporter = reporter
            // todo bug:load happens when new instance, it's too late to tap
            // reporter.optionalHooks.onLoadEnd.tap('onLoadEnd', emptyFunc)
            reporter.optionalHooks.onPushEnd.tap('onPushEnd', emptyFunc)
            reporter.optionalHooks.onDumpFail.tap('onDumpFail', emptyFunc)
            reporter.optionalHooks.onLastSyncFail.tap('onLastSyncFail', emptyFunc)
            const result = [typeof reporter === 'object']
            const checkFuncs = ['start', 'push']
            checkFuncs.forEach(key => {
                result.push(key in reporter)
            })
            return result.filter(Boolean).length
        }, [packageName, exportName, fakeURL])
        expect(_).toBe(3)
    })
})

describe('batch-reporter-web Functional Test', () => {
    describe('sendBeacon when visibilitychange', () => {
        test(`sendBeacon return true`, async () => {
            fakeSendBeacon.mockReset()
            fakeSendBeacon.mockImplementation(() => true)
            await testPage.bringToFront()
            expect(fakeSendBeacon).toHaveBeenCalledTimes(0)
            await blankPage.bringToFront()
            await testPage.bringToFront()
            expect(fakeSendBeacon).toHaveBeenCalledTimes(1)
            expect(fakeSendBeacon).toHaveBeenLastCalledWith(fakeURL, [])
        })
        test(`sendBeacon return false`, async () => {
            emptyFunc.mockReset()
                .mockReturnValueOnce(false)
            await testPage.evaluate(async () => {
                /**
                 * can't use fakeSendBeacon.mockXxx
                 * because exposeFunction is based on binding
                 * so it's always return Promise, which is truthy
                 */
                navigator.sendBeacon = () => false
            })
            await testPage.bringToFront()
            await blankPage.bringToFront()
            await testPage.bringToFront()
            expect(emptyFunc).toBeCalledTimes(1)
            expect(emptyFunc).toHaveBeenLastCalledWith([])
            await testPage.evaluate(async () => {
                navigator.sendBeacon = fakeSendBeacon
            })
        })
    })

    describe('push and dump', () => {
        test('check dump after push', async () => {
            emptyFunc.mockReset()
            const dump = await testPage.evaluate(async ([dumpKey], testObj) => {
                reporter.push(testObj)
                return localStorage.getItem(dumpKey)
            }, [exportName], testObj)
            expect(emptyFunc).toHaveBeenCalledTimes(1)
            expect(emptyFunc).toHaveBeenLastCalledWith()
            expect(dump).toEqual(JSON.stringify([testObj]))
            await testPage.evaluate(async () => {
                reporter.cache = []
            })
        })

        test('tryDump fail and retry success, then push again and dump success', async () => {
            const _ = await testPage.evaluate(async (testObj, exportName) => {
                localStorage.clear()
                let count = 0
                const result = []
                localStorage.setItem = (...args) => {
                    count++
                    if (count <= 1) {
                        throw new Error("fakeSetItem");
                    } else {
                        originSetItem(...args)
                    }
                }
                reporter.push(testObj)
                await sleep()
                result.push(localStorage.getItem(exportName))
                reporter.push(testObj)
                await sleep()
                result.push(localStorage.getItem(exportName))
                result.unshift(count)
                localStorage.setItem = originSetItem
                return result
            }, testObj, exportName)
            expect(_).toEqual([3, JSON.stringify([testObj]), JSON.stringify([testObj, testObj])])
            await testPage.evaluate(async () => {
                reporter.cache = []
            })
        })

        test('tryDump fail and retry fail, then push again and dump success', async () => {
            emptyFunc.mockClear()
            const _ = await testPage.evaluate(async (testObj, exportName) => {
                localStorage.clear()
                const result = []
                let count = 0
                localStorage.setItem = (...args) => {
                    count++
                    if (count <= 3) {
                        throw new Error('fakeSetItem')
                    } else {
                        originSetItem(...args)
                    }
                }
                reporter.push(testObj)
                await sleep()
                result.push(localStorage.getItem(exportName) ?? '[]')
                reporter.push(testObj)
                await sleep()
                result.push(localStorage.getItem(exportName))
                result.unshift(count)
                localStorage.setItem = originSetItem
                return result
            }, testObj, exportName)
            expect(emptyFunc).toHaveBeenNthCalledWith(1)
            expect(emptyFunc).toHaveBeenNthCalledWith(2, [testObj])
            expect(emptyFunc).toHaveBeenNthCalledWith(3)
            expect(emptyFunc).toHaveBeenCalledTimes(2 + 1)
            expect(_).toEqual([4, '[]', JSON.stringify([testObj, testObj])])
            await testPage.evaluate(async () => {
                reporter.cache = []
            })
        })
    })

    describe('load localStorage when new', () => {
        test('check load after new', async () => {
            const dump = await testPage.evaluate(async (testObj) => {
                localStorage.clear()
                const dumpKey = 'test'
                localStorage.setItem(dumpKey, JSON.stringify([testObj]))
                const testReporter = new WebBatchReporter({
                    request: () => { },
                    dumpKey,
                    beaconUrl: '',
                })
                await sleep(100)
                // return localStorage.getItem(dumpKey)
                return testReporter.cache
            }, testObj)
            expect(dump).toEqual([testObj])
        })
    })

    describe('start intervalRequest', () => {
        test('do not request without data', async () => {
            emptyFunc.mockClear()
            const _ = await testPage.evaluate(async () => {
                localStorage.clear()
                const dumpKey = 'test'
                const testReporter = new WebBatchReporter({
                    request: emptyFunc,
                    dumpKey,
                    beaconUrl: '',
                    delay: 100,
                })
                testReporter.start()
                await sleep(250)
                return localStorage.getItem(dumpKey) ?? '[]'
            })
            expect(emptyFunc).toBeCalledTimes(0)
            expect(_).toEqual('[]')
        })

        test('dump [] after request success', async () => {
            emptyFunc.mockReset()
            emptyFunc.mockImplementation(async () => {
                return true
            })
            const _ = await testPage.evaluate(async (testObj) => {
                localStorage.clear()
                const dumpKey = 'test'
                const testReporter = new WebBatchReporter({
                    request: emptyFunc,
                    dumpKey,
                    beaconUrl: '',
                    delay: 100,
                })
                testReporter.start()
                testReporter.push(testObj)
                await sleep(250)
                return localStorage.getItem(dumpKey)
            }, testObj)
            expect(emptyFunc).toBeCalledTimes(1)
            expect(emptyFunc).toHaveBeenLastCalledWith([testObj])
            expect(_).toEqual('[]')
        })

        test('do nothing after request fail', async () => {
            emptyFunc.mockReset()
            emptyFunc.mockImplementation(async () => {
                return false
            })
            const _ = await testPage.evaluate(async (testObj) => {
                localStorage.clear()
                const dumpKey = 'test'
                const testReporter = new WebBatchReporter({
                    request: emptyFunc,
                    dumpKey,
                    beaconUrl: '',
                    delay: 100,
                })
                testReporter.start()
                testReporter.push(testObj)
                await sleep(250)
                return localStorage.getItem(dumpKey)
            }, testObj)
            expect(emptyFunc).toBeCalledTimes(2)
            expect(emptyFunc).toHaveBeenNthCalledWith(1, [testObj])
            expect(emptyFunc).toHaveBeenNthCalledWith(2, [testObj])
            expect(_).toEqual(JSON.stringify([testObj]))
        })
    })
})
