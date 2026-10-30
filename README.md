> 文档模板：v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-xlog-jsi</code> </h1>
</p>

本项目基于 [react-native-xlog-jsi](https://github.com/Flickering-AI/react-native-xlog-jsi) 开发。

该第三方库的仓库已迁移至 Gitcode，且支持直接从 npm 下载，新的包名为：`@react-native-ohos/react-native-xlog-jsi`，版本所属关系如下：

| 三方库名称 | 三方库版本（npm地址） | 发布信息 | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | 源码地址 |
| - | - | - | - | - | - | - | - |
| @react-native-ohos/react-native-xlog-jsi | [~ 0.4.3 （开发中）](https://www.npmjs.com/package/@react-native-ohos/react-native-xlog-jsi) | [Github Releases](https://github.com/react-native-oh-library/react-native-xlog-jsi/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | 是 | API12+ | 0.4.2 | [master](https://github.com/react-native-oh-library/react-native-xlog-jsi/tree/master) |

## 简介

本库通过 JSI 初始化 [mars xlog](https://github.com/Tencent/mars)，并在鸿蒙侧将 React Native 的 console 日志写入 xlog。JS 接口提供 `Xlog` 构造函数及 `Xlog.appenderFlush()`，用于初始化和刷新日志。

## 下载安装

进入到工程目录并输入以下命令：

**npm**

```bash
npm install @react-native-ohos/react-native-xlog-jsi
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-xlog-jsi
```

## Link

| | 是否支持autolink | RN框架版本 |
| - | - | - |
| ~ 0.4.3 | Yes | 0.72.* / 0.77.* / 0.82.* / 0.84.* |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过ManualLink配置。
<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

### 1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 overrides 字段，指向工程需要使用的 RN SDK 版本。替换的版本既可以是一个具体的版本号，也可以是一个模糊版本，还可以是本地存在的 HAR 包或源码目录。

关于该字段的作用请阅读[官方说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#zh-cn_topic_0000001792256137_overrides)

```json5
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.84.2"
  }
}
```

### 2. 引入原生端代码

目前有两种方法：

- 通过 har 包引入；
- 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "@react-native-ohos/react-native-xlog-jsi": "file:../../node_modules/@react-native-ohos/react-native-xlog-jsi/harmony/xlog_jsi.har"
  }
```

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/link-source-code.md)

### 3. 配置 CMakeLists 和引入 RNXlogJSIPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-xlog-jsi/src/main/cpp" ./rn_xlog_jsi)
# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_xlog_jsi)
# RNOH_END: manual_package_linking_2
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
#include "SamplePackage.h"
+ #include "RNXlogJSIPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<SamplePackage>(ctx),
+     std::make_shared<rnoh::RNXlogJSIPackage>(ctx),
    };
}
```

### 4. 在 ArkTS 侧引入 RNXlogJSIPackage

打开 `entry/src/main/ets/RNPackagesFactory.ets`，添加：

```diff
  ...
+ import { RNXlogJSIPackage } from '@react-native-ohos/react-native-xlog-jsi';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+    new RNXlogJSIPackage(ctx),
  ];
}
```

</details>

#### 运行

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。



## 约束与限制

### 兼容性

1. RNOH: 0.72.33; SDK: HarmonyOS NEXT B1; IDE: DevEco Studio: 5.0.3.900; ROM: Next.0.0.71;
2. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
3. RNOH: 0.82.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM:6.0.0.120 SP7;
4. RNOH: 0.84.2; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.2.636; ROM: 6.0.0.125;

当前已完成 RN 0.84 示例的 JS bundle 和鸿蒙 HAP 构建，尚未完成设备运行验证。0.72、0.77、0.82 已提供示例依赖配置，构建和设备兼容性需分别验证。鸿蒙原生构建目前提供 arm64-v8a 架构支持。

### 权限要求

无

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

无

## 其他

无

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
├── README.md                  # 中文文档
└── README_en.md               # 英文文档
```

## 贡献代码

欢迎在[项目仓库](https://github.com/react-native-oh-library/react-native-xlog-jsi)提交 Issue 或 Pull Request。

## 开源协议

[MIT License](LICENSE)
