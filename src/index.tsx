import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-xlog-jsi' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

// global func declaration for JSI functions
declare global {
  function xlogAppenderFlush(isSync: boolean): unknown;
}

interface XlogJsiModule {
  install(rootDirectory: string, namePrefix: string, cacheDays: number, isConsoleLogOpen: boolean): void;
}

const nativeXlogJsi = (Platform.OS as string) === 'harmony'
  ? (require('react-native').TurboModuleRegistry.get('XlogJsi') as XlogJsiModule | null)
  : NativeModules.XlogJsi;

const XlogJsi = nativeXlogJsi
  ? nativeXlogJsi
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export default class Xlog {
  constructor(
    rootDirectory: string = 'xlogs',
    namePrefix: string = 'XLog',
    cacheDays: number = 3,
    isConsoleLogOpen: boolean = !!__DEV__
  ) {
    if (!global.xlogAppenderFlush) {
      XlogJsi.install(rootDirectory, namePrefix, cacheDays, isConsoleLogOpen);
    }
  }

  static async appenderFlush(isSync: boolean = true) {
    return global.xlogAppenderFlush(isSync);
    // return XlogJsi.appenderFlush(isSync);
  }
}
