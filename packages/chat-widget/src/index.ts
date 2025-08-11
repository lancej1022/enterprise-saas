// Main exports for the chat widget library
export { createRouter, boot } from "./router";

// Export any types that might be useful for consumers
export type { Router } from "@tanstack/react-router";

// Re-export the boot function parameters type for convenience
export interface ChatWidgetConfig {
  app_id: string;
  created_at?: number;
  email: string;
  name: string;
  user_id: string;
}
