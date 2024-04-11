# BatchReporter

批量收集数据并上报：常用于埋点、监控、日志等场景

## 特性

- 使用前同步本地已有数据
- 收集数据即存储本地，不丢失
- 定时批量上报，避免请求占用
- 使用tapable扩展，以支持多平台
- ~~可暂停~~（考虑中

## 策略

![design](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Benno-Wu/BatchReporter/alpha/design.wsd)

## 使用指南

```ts
// core 核心逻辑实现，用于扩展至各平台
// 配置项
interface CoreConfig{
    autostart?: boolean, // 自动开始定时上报
    retry?: number, // dump失败重试次数
    request: AsyncDataHandler<data>, // 发送数据到远程
    sendBeacon: DataHandler<data>, // 类同浏览器sendBeacon，用于最后时刻发送数据
    delay?: number, // 定时上报时间间隔
    setInterval: (interval: unknownFunction, delay?: number) => void, // 不同运行环境提供的定时器函数
}

// 核心扩展项
hooks = {
    // 需要注册数据存入本地的方法
    dump: new AsyncSeriesWaterfallHook<[data[]], boolean>(['data']),
    // 需要注册从本地读取数据的方法
    load: new AsyncSeriesWaterfallHook<'never', data[]>(['never']),
}
// 可选扩展项：目前用于执行过程的事件监听
optionalHooks = {
    onLoadEnd: new SyncHook<void>(),
    onPushEnd: new SyncHook<void>(),
    onLoadFail: new SyncHook<unknown>(['error']),
    onDumpFail: new SyncHook<[data[]]>(['data']),
    onLastSyncFail: new SyncHook<[data[]]>(['data']),
    onError: new SyncHook<unknown>(['error'])
}

// web 继承core，并提供web平台的适配实现
interface WebConfig<T> {
    dumpKey: string, // 本地存储的key值，用于读写查找
    dumpFormatter?: DataHandler<T, string>, // 一般都需要序列化成字符串，默认使用JSON
    loadFormatter?: DataLoader<T[]>, // 反序列化，默认使用JSON
    enableLastSync?: boolean, // 是否开启最后时刻的上报，基于visibilitychange事件
    // 参考sendBeacon设计
    beaconUrl: string, // 最后上报数据的接口地址
    beaconTransform?: (data: T) => Parameters<typeof navigator.sendBeacon>[1] // 可能需要转化下数据格式，默认不转化，透传数组
}

// web 示例代码
import { WebBatchReporter } from '@bennowu/batch-reporter-web'
const reporter = new WebBatchReporter({
    request: async()=>{},
    dumpKey: 'string',
    beaconUrl: 'url',
})
reporter.start()
reporter.push(data)
```

## bug

- optionalHooks

>短期设计，没有很好的测试，初始化时存在一些问题，运行时可用
