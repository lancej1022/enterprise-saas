import { cleanupExpiredSessions } from "./chat-security";

/**
 * Manual cleanup function for maintenance
 */
export async function runManualCleanup() {
  try {
    const deletedCount = await cleanupExpiredSessions();
    return {
      success: true,
      message: `Cleaned up ${deletedCount} expired sessions`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
