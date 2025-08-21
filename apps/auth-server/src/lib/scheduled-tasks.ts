import { cleanupExpiredSessions } from "./chat-security";

async function intervalFunc() {
  try {
    const deletedCount = await cleanupExpiredSessions();
    if (deletedCount > 0) {
      // eslint-disable-next-line no-console -- Intentional logging for system maintenance
      console.log(`Cleaned up ${deletedCount} expired chat sessions`);
    }
  } catch (error) {
    console.error("Error cleaning up expired chat sessions:", error);
  }
}

/**
 * Run cleanup tasks periodically
 */
export function startScheduledTasks() {
  // Clean up expired chat sessions every 15 minutes
  setInterval(
    () => {
      void intervalFunc();
    },
    15 * 60 * 1000,
  ); // 15 minutes

  // eslint-disable-next-line no-console -- Intentional logging for system startup
  console.log("Scheduled tasks started");
}

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
