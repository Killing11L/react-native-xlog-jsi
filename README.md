> 文档模板:v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-xlog-jsi</code> </h1>
</p>

本项目基于 [react-native-xlog-jsi](https://github.com/Flickering-AI/react-native-xlog-jsi) 开发，提供 React Native OpenHarmony（RNOH）适配。鸿蒙包名为 `@react-native-ohos/react-native-xlog-jsi`，JS 别名为 `react-native-xlog-jsi`。

| 三方库名称 | 三方库版本 | 发布信息 | RN 示例配置 | Autolink | 源码地址 |
| - | - | - | - | - | - |
| @react-native-ohos/react-native-xlog-jsi | 0.4.3 | [GitHub Releases](https://github.com/react-native-oh-library/react-native-xlog-jsi/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | 已配置 | [源码](https://github.com/react-native-oh-library/react-native-xlog-jsi) |

上述版本表示仓库提供了对应的示例依赖配置，并不代表所有版本均已完成设备验证。

## 简介

本库通过 JSI 初始化 [mars xlog](https://github.com/Tencent/mars)，并在鸿蒙侧将 React Native 的 console 日志写入 xlog。JS 接口提供 `Xlog` 构造函数及 `Xlog.appenderFlush()`，用于初始化和刷新日志。

## Link

项目需先安装 `@react-native-ohos/react-native-xlog-jsi`。使用 Autolink 的工程请参考 [RNOH Autolinking 文档](https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md)。本库已声明 Autolink 配置；不同框架版本的自动链接行为需分别验证。若工程已正确完成自动链接，可跳过下方手动链接步骤。

<details>
  <summary>ManualLink：手动配置原生依赖</summary>

在 DevEco Studio 中打开项目的 `harmony` 目录。

### 1. Overrides RN SDK

在鸿蒙工程根目录的 `oh-package.json5` 中，将 RNOH 依赖指向工程使用的版本。例如：

```json5
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.84.2"
  }
}
```

其他 RN 版本请使用对应的 RNOH 版本，或根据项目配置使用本地 HAR 包或源码目录。

### 2. 引入原生端代码

在 `entry/oh-package.json5` 中引入本库的 HAR，或直接链接源码。示例工程使用源码方式：

```json5
{
  "dependencies": {
    "@rnoh/react-native-openharmony": "file:../../node_modules/@react-native-oh/react-native-harmony/react_native_openharmony.har",
    "@react-native-ohos/react-native-xlog-jsi": "file:../../../harmony/xlog_jsi"
  }
}
```

上面的相对路径适用于本仓库的 `example/harmony/entry`，其他工程请按实际位置调整。配置后在 DevEco Studio 中同步，或在 `entry` 目录执行 `ohpm install`。

### 3. 配置 CMakeLists 和引入 RNXlogJSIPackage

在 `entry/src/main/cpp/CMakeLists.txt` 中添加本库，并链接到应用目标：

```cmake
add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-xlog-jsi/src/main/cpp" ./rn_xlog_jsi)
target_link_libraries(rnoh_app PUBLIC rnoh_xlog_jsi)
```

在 `entry/src/main/cpp/PackageProvider.cpp` 中注册：

```cpp
#include "RNXlogJSIPackage.h"

// 在 PackageProvider::getPackages() 的返回列表中添加：
std::make_shared<rnoh::RNXlogJSIPackage>(ctx),
```

### 4. 在 ArkTS 侧引入 RNXlogJSIPackage

在 `entry/src/main/ets/RNPackagesFactory.ets` 中添加：

```ts
import { RNXlogJSIPackage } from '@react-native-ohos/react-native-xlog-jsi';

// 在 createRNPackages(ctx) 的返回列表中添加：
new RNXlogJSIPackage(ctx),
```

</details>

### 运行

示例默认使用 RN 0.84。切换版本时，将 `example/package-82.json`、`package-77.json` 或 `package-72.json` 复制为 `example/package.json`，并重新安装依赖；对应的鸿蒙 SDK 和工程配置也需匹配。

在仓库根目录安装依赖并执行 `npm pack`；在 `example` 目录安装依赖并执行 `npm run dev`；然后在 DevEco Studio 中同步并构建 `example/harmony`。在首页点击 `rnt` 进入 JSI 手动测试页面。

## 约束与限制

### 兼容性

当前已完成 RN 0.84 示例的 JS bundle 和鸿蒙 HAP 构建，尚未完成设备运行验证。0.72、0.77、0.82 已提供示例依赖配置，构建和设备兼容性需分别验证。鸿蒙原生构建目前提供 arm64-v8a 架构支持。

### 权限要求

使用应用沙箱内可写目录时，无需额外存储权限。

### 编译运行 API 要求

示例工程配置的最低兼容版本为 API 12；其他环境需结合对应 RNOH 版本进行验证。

## 使用示例

```ts
import Xlog from '@react-native-ohos/react-native-xlog-jsi';

const logger = new Xlog(
  '/data/storage/el2/base/haps/entry/cache',
  'XLogJsi',
  3,
  true
);
console.log('hello xlog');
await Xlog.appenderFlush(true);
```

## 使用说明

**初始化**：构造函数的默认参数依次为 `xlogs`、`XLog`、`3`、`__DEV__`。鸿蒙环境建议传入已存在且可写的沙箱绝对路径。

**刷新**：先初始化，再调用 `Xlog.appenderFlush(true)` 同步刷新；传入 `false` 发起异步刷新，调用返回不代表异步写入已完成。日志文件为二进制格式，需使用对应的 mars xlog 解码工具查看。

本库没有独立的六级日志写入方法或崩溃处理器接口。示例中的 console 按钮用于测试日志输出。

## 接口说明

### 构造函数

| 参数 | 类型 | 默认值 | 说明 |
| - | - | - | - |
| rootDirectory | `string` | `xlogs` | 日志目录；鸿蒙环境应使用已存在且可写的绝对路径 |
| namePrefix | `string` | `XLog` | 日志文件名前缀 |
| cacheDays | `number` | `3` | 传递给底层的缓存保留天数 |
| isConsoleLogOpen | `boolean` | `!!__DEV__` | 是否开启日志控制台回显 |

### 方法

| 名称 | 说明 | 类型 | HarmonyOS Support |
| - | - | - | - |
| appenderFlush | 刷新日志；`true` 为同步，`false` 为异步，默认 `true` | `(isSync?: boolean) => Promise<unknown>` | 已实现，设备待验证 |

## 遗留问题

无。

## 其他

无。

## 目录结构

```text
/xlog-jsi
├── harmony/xlog_jsi/          # 鸿蒙原生实现
│   └── src/main/              # C++ 和 ArkTS 模块
├── src/index.tsx              # JS 接口
├── example/                   # 示例工程及不同 RN 版本配置
│   ├── src/App.tsx            # 首页和手动测试页面
│   └── harmony/               # 鸿蒙示例工程
├── jest/                      # JS 白盒测试及配置
├── test-cases.md              # 手动测试步骤
├── README.md                  # 中文文档
└── README_en.md               # 英文文档
```

## 贡献代码

欢迎在[项目仓库](https://github.com/react-native-oh-library/react-native-xlog-jsi)提交 Issue 或 Pull Request。

## 开源协议

[MIT License](LICENSE)
