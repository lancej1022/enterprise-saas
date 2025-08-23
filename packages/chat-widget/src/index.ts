// Main exports for the chat widget library
export { createRouter, boot } from "./router";

// Re-export the boot function parameters type for convenience
export interface ChatWidgetConfig {
  app_id: string;
  created_at?: number;
  email: string;
  name: string;
  onSecurityError?: (error: string, code: string) => void;
  // Security configuration
  organizationId: string;
  user_id: string;
  userJWT?: string;
}
