import { RNXlogJSIPackage } from '@react-native-ohos/react-native-xlog-jsi';
import { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [new RNXlogJSIPackage(ctx)];
}
