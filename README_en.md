> Document Template:v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-xlog-jsi</code> </h1>
</p>

This project is based on [react-native-xlog-jsi](https://github.com/Flickering-AI/react-native-xlog-jsi) and provides a React Native OpenHarmony (RNOH) adaptation. Its HarmonyOS package is `@react-native-ohos/react-native-xlog-jsi`, with the JS alias `react-native-xlog-jsi`.

| Name | Version | Release Information | Example RN Configurations | Autolink | Source |
| - | - | - | - | - | - |
| @react-native-ohos/react-native-xlog-jsi | 0.4.3 | [GitHub Releases](https://github.com/react-native-oh-library/react-native-xlog-jsi/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | Configured | [Source](https://github.com/react-native-oh-library/react-native-xlog-jsi) |

The versions above indicate that example dependency configurations are provided; they do not mean all versions have been verified on devices.

## Introduction

The library initializes [mars xlog](https://github.com/Tencent/mars) through JSI and writes React Native console output to xlog on HarmonyOS. The JS API provides the `Xlog` constructor and `Xlog.appenderFlush()` for initialization and flushing.

## Link

Install `@react-native-ohos/react-native-xlog-jsi` in the project first. For projects using Autolink, see the [RNOH Autolinking guide](https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/en/Autolinking.md). This library declares an Autolink configuration; its behavior must be verified for each framework version. If Autolink is already configured correctly, the manual linking steps below can be skipped.

<details>
  <summary>ManualLink: configure native dependencies manually</summary>

Open the project's `harmony` directory in DevEco Studio.

### 1. Overrides RN SDK

In the HarmonyOS project's root `oh-package.json5`, point the RNOH dependency to the version used by the project. For example:

```json5
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.84.2"
  }
}
```

Use the matching RNOH version for other RN versions, or use a local HAR package or source directory as appropriate for your project.

### 2. Import native code

Add the library HAR or link its source in `entry/oh-package.json5`. The example project links the source:

```json5
{
  "dependencies": {
    "@rnoh/react-native-openharmony": "file:../../node_modules/@react-native-oh/react-native-harmony/react_native_openharmony.har",
    "@react-native-ohos/react-native-xlog-jsi": "file:../../../harmony/xlog_jsi"
  }
}
```

These paths apply to this repository's `example/harmony/entry`; adjust them for other projects. Sync in DevEco Studio or run `ohpm install` in the `entry` directory.

### 3. Configure CMakeLists and import RNXlogJSIPackage

Add the library and link it to the application target in `entry/src/main/cpp/CMakeLists.txt`:

```cmake
add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-xlog-jsi/src/main/cpp" ./rn_xlog_jsi)
target_link_libraries(rnoh_app PUBLIC rnoh_xlog_jsi)
```

Register it in `entry/src/main/cpp/PackageProvider.cpp`:

```cpp
#include "RNXlogJSIPackage.h"

// Add to the return list in PackageProvider::getPackages():
std::make_shared<rnoh::RNXlogJSIPackage>(ctx),
```

### 4. Import RNXlogJSIPackage on the ArkTS side

Add the package in `entry/src/main/ets/RNPackagesFactory.ets`:

```ts
import { RNXlogJSIPackage } from '@react-native-ohos/react-native-xlog-jsi';

// Add to the return list in createRNPackages(ctx):
new RNXlogJSIPackage(ctx),
```

</details>

### Run

The example defaults to RN 0.84. To switch versions, copy `example/package-82.json`, `package-77.json`, or `package-72.json` to `example/package.json` and reinstall dependencies. The HarmonyOS SDK and project configuration must also match the selected version.

Install dependencies and run `npm pack` in the repository root. Install dependencies and run `npm run dev` in `example`, then sync and build `example/harmony` in DevEco Studio. Select `rnt` on the home screen to open the JSI manual test page.

## Constraints and Limitations

### Compatibility

The RN 0.84 example's JS bundle and HarmonyOS HAP have been built, but have not yet been verified on a device. Example dependency configurations are provided for 0.72, 0.77, and 0.82; build and device compatibility must be verified separately. The HarmonyOS native build currently supports arm64-v8a.

### Permission Requirements

No additional storage permission is required when using a writable app sandbox directory.

### Build and Run API Requirements

The example project sets its minimum compatible version to API 12. Other environments must be verified with the corresponding RNOH version.

## Usage Example

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

## Usage

**Initialization:** The constructor defaults are `xlogs`, `XLog`, `3`, and `__DEV__`, respectively. On HarmonyOS, use an existing writable absolute path in the app sandbox.

**Flushing:** Initialize first, then call `Xlog.appenderFlush(true)` for a synchronous flush. Pass `false` to request an asynchronous flush; the call returning does not mean the asynchronous write has finished. Log files are binary and require a compatible mars xlog decoder.

This library does not expose separate methods for six log levels or a crash handler. The example's console buttons test log output.

## API

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

## Others

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
├── test-cases.md              # Manual test steps
├── README.md                  # Chinese documentation
└── README_en.md               # English documentation
```

## Contributing

Issues and pull requests are welcome in the [project repository](https://github.com/react-native-oh-library/react-native-xlog-jsi).

## License

[MIT License](LICENSE)
