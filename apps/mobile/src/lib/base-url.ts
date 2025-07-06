import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export function getBaseUrl() {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    throw new Error(
      "Failed to get localhost. Please point to your production server.",
    );
  }

  return Platform.select({
    ios: `http://${localhost}:3000`,
    // Android emulator requires `10.0.2.2` instead of `localhost` for local networking. Probably needs further refinement for working on devices and production
    // TODO: review https://www.reddit.com/r/reactnative/comments/1kfey5v/tip_accessing_a_local_backend_from_android_use/ and other resources
    android: `http://10.0.2.2:3000`,
    default: `http://${localhost}:3000`,
  });
}
