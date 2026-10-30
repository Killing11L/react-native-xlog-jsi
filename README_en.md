> Document Template: v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-xlog-jsi</code> </h1>
</p>

This project is based on [react-native-xlog-jsi](https://github.com/Flickering-AI/react-native-xlog-jsi).

This third-party library has been migrated to Gitcode and is now available for direct download from npm, the new package name is: `@react-native-ohos/react-native-xlog-jsi`, the version correspondence details are as follows:

| Name | Version(Npm Address) | Release Information | Supported RN Version | Supported Autolink | Compile API Version | Community Baseline Version | Source code address |
| - | - | - | - | - | - | - | - |
| @react-native-ohos/react-native-xlog-jsi | [~ 0.4.3 (In development)](https://www.npmjs.com/package/@react-native-ohos/react-native-xlog-jsi) | [Github Releases](https://github.com/react-native-oh-library/react-native-xlog-jsi/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | Yes | API12+ | 0.4.2 | [master](https://github.com/react-native-oh-library/react-native-xlog-jsi/tree/master) |

## Introduction

The library initializes [mars xlog](https://github.com/Tencent/mars) through JSI and writes React Native console output to xlog on HarmonyOS. The JS API provides the `Xlog` constructor and `Xlog.appenderFlush()` for initialization and flushing.

## Installation

Go to the project directory and execute the following instruction:

**npm**

```bash
npm install @react-native-ohos/react-native-xlog-jsi
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-xlog-jsi
```

## Link

| | Supported Autolink | Supported RN Version |
| - | - | - |
| ~ 0.4.3 | Yes | 0.72.* / 0.77.* / 0.82.* / 0.84.* |

Projects using AutoLink need to be configured according to this document, AutoLink framework guide: https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/en/Autolinking.md

If the version you are using supports Autolink and the project has integrated Autolink, you can skip the ManualLink configuration.

<details>
  <summary>ManualLink: This step provides guidance for manually configuring native dependencies.</summary>

Open the `harmony` directory of the OpenHarmony project in DevEco Studio.

### 1. Overrides RN SDK

To ensure the project relies on the same version of the RN SDK, you need to add an `overrides` field in the project's root `oh-package.json5` file, specifying the RN SDK version to be used. The replacement version can be a specific version number, a semver range, or a locally available HAR package or source directory.

For more information about the purpose of this field, please refer to the [official documentation](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#en-us_topic_0000001792256137_overrides).

```json5
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.84.2"
  }
}
```

### 2. Introducing Native Code

Currently, two methods are available:

- Use the HAR file.
- Directly link to the source code.

Method 1 (recommended): Use the HAR file.

> [!TIP] The HAR file is stored in the `harmony` directory in the installation path of the third-party library.

Open `entry/oh-package.json5` file and add the following dependencies:

```json
"dependencies": {
    "@react-native-ohos/react-native-xlog-jsi": "file:../../node_modules/@react-native-ohos/react-native-xlog-jsi/harmony/xlog_jsi.har"
  }
```

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Method 2: Directly link to the source code.

> [!TIP] For details, see [Directly Linking Source Code](https://gitcode.com/CPF-RN/usage-docs/blob/master/en/link-source-code.md).

### 3. Configuring CMakeLists and Introducing RNXlogJSIPackage

Open `entry/src/main/cpp/CMakeLists.txt` and add the following code:

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

Open `entry/src/main/cpp/PackageProvider.cpp` and add:

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

### 4. Introducing RNXlogJSIPackage to ArkTS

Open `entry/src/main/ets/RNPackagesFactory.ets` and add:

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

## Running

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Then build and run the code.


## Constraints

### Compatibility

1. RNOH: 0.72.33; SDK: HarmonyOS NEXT B1; IDE: DevEco Studio: 5.0.3.900; ROM: Next.0.0.71;
2. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
3. RNOH: 0.82.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;
4. RNOH: 0.84.2; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.2.636; ROM: 6.0.0.125;

The RN 0.84 example's JS bundle and HarmonyOS HAP have been built, but have not yet been verified on a device. Example dependency configurations are provided for 0.72, 0.77, and 0.82; build and device compatibility must be verified separately. The HarmonyOS native build currently supports arm64-v8a.

### Permission Requirements

None.

## Example

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

## How to Use

**Initialization:** The constructor defaults are `xlogs`, `XLog`, `3`, and `__DEV__`, respectively. On HarmonyOS, use an existing writable absolute path in the app sandbox.

**Flushing:** Initialize first, then call `Xlog.appenderFlush(true)` for a synchronous flush. Pass `false` to request an asynchronous flush; the call returning does not mean the asynchronous write has finished. Log files are binary and require a compatible mars xlog decoder.

This library does not expose separate methods for six log levels or a crash handler. The example's console buttons test log output.

## Available APIs

### Constructor

| Parameter | Type | Default | Description |
| - | - | - | - |
| rootDirectory | `string` | `xlogs` | Log directory; use an existing writable absolute path on HarmonyOS |
| namePrefix | `string` | `XLog` | Log file prefix |
| cacheDays | `number` | `3` | Cache retention days passed to the native implementation |
| isConsoleLogOpen | `boolean` | `!!__DEV__` | Whether to echo logs to the console |

### Methods

| Name | Description | Type | HarmonyOS Support |
| - | - | - | - |
| appenderFlush | Flush logs; `true` is synchronous, `false` is asynchronous, default is `true` | `(isSync?: boolean) => Promise<unknown>` | Implemented; device verification pending |

## Known Issues

None.

## Other

None.

## Directory Structure

```text
/xlog-jsi
├── harmony/xlog_jsi/          # HarmonyOS native implementation
│   └── src/main/              # C++ and ArkTS modules
├── src/index.tsx              # JS API
├── example/                   # Example project and RN version configurations
│   ├── src/App.tsx            # Home screen and manual test page
│   └── harmony/               # HarmonyOS example project
├── jest/                      # JS unit tests and configuration
├── README.md                  # Chinese documentation
└── README_en.md               # English documentation
```

## How to Contribute

Issues and pull requests are welcome in the [project repository](https://github.com/react-native-oh-library/react-native-xlog-jsi).

## License

[MIT License](LICENSE)
