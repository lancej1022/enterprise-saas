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
  const localhost = debuggerHost?.split(":")[0] || "localhost";

  if (!localhost) {
    console.error("Failed to get localhost:", localhost);
    throw new Error(
      "Failed to get localhost. Please point to your production server.",
    );
  }
  return `http://${localhost}:3000`;
}
