/**
 * Chat Widget Security Utilities
 * Handles initialization, authentication, and session management
 */

import { client } from "./orpc";

export interface ChatWidgetSecurityConfig {
  apiBaseUrl?: string;
  domain?: string;
  organizationId: string;
  userJWT?: string;
}

export interface ChatSessionInfo {
  expiresAt?: number;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
  sessionToken: string;
  userIdentifier?: null | string;
}

interface SecurityValidationResult {
  error?: string;
  securityLevel?: "basic" | "jwt_required";
  sessionInfo?: ChatSessionInfo;
  success: boolean;
}

function getCurrentDomain(): string {
  if (typeof window === "undefined") {
    return "unknown";
  }
  return window.location.hostname;
}

/**
 * Initialize chat widget security by validating with the server
 */
export async function initializeChatSecurity(
  config: ChatWidgetSecurityConfig,
): Promise<SecurityValidationResult> {
  const { organizationId, userJWT, domain: domainOverride } = config;

  try {
    // Create ORPC client with the specified API base URL

    // Use domain override if provided, otherwise auto-detect
    const domain = domainOverride || getCurrentDomain();

    // Make type-safe request to chat initialization endpoint
    const result = await client.chat.init({
      organizationId,
      userJWT,
      domain,
    });

    return {
      success: result.success,
      sessionInfo: result.success
        ? {
            sessionToken: result.sessionToken,
            userIdentifier: result.userIdentifier,
            rateLimitInfo: result.rateLimitInfo,
          }
        : undefined,
      error: result.success ? undefined : "Chat initialization failed",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get organization security configuration
 */
export async function getOrganizationConfig(organizationId: string): Promise<{
  config?: {
    allowedDomains: string[];
    securityLevel: "basic" | "jwt_required";
    sessionDuration: number;
  };
  error?: string;
  success: boolean;
}> {
  try {
    // Create ORPC client with the specified API base URL

    // Make type-safe request to get organization configuration
    const result = await client.chat.getConfig({
      organizationId,
    });

    return {
      success: true,
      config: {
        securityLevel: result.securityLevel,
        allowedDomains: result.allowedDomains,
        sessionDuration: result.sessionDuration,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get config",
    };
  }
}

/**
 * Validate an existing session token
 */
export async function validateSession(
  sessionToken: string,
): Promise<{ error?: string; valid: boolean }> {
  try {
    // Create ORPC client with the specified API base URL

    // Make type-safe request to validate session
    const result = await client.chat.validateSession({
      sessionToken,
    });

    return { valid: result.valid };
  } catch {
    return { valid: false, error: "Session validation failed" };
  }
}

/**
 * Error types for better error handling
 */
export class ChatSecurityError extends Error {
  code:
    | "DOMAIN_NOT_ALLOWED"
    | "JWT_INVALID"
    | "JWT_REQUIRED"
    | "ORGANIZATION_NOT_FOUND"
    | "RATE_LIMITED"
    | "UNKNOWN";
  constructor(
    message: string,
    code:
      | "DOMAIN_NOT_ALLOWED"
      | "JWT_INVALID"
      | "JWT_REQUIRED"
      | "ORGANIZATION_NOT_FOUND"
      | "RATE_LIMITED"
      | "UNKNOWN",
  ) {
    super(message);
    this.name = "ChatSecurityError";
    this.code = code;
  }
}

/**
 * Parse error message and return appropriate error code
 */
export function parseSecurityError(error: string): ChatSecurityError {
  if (error.includes("not authorized") || error.includes("Domain")) {
    return new ChatSecurityError(error, "DOMAIN_NOT_ALLOWED");
  }
  if (error.includes("JWT") && error.includes("required")) {
    return new ChatSecurityError(error, "JWT_REQUIRED");
  }
  if (error.includes("JWT") || error.includes("token")) {
    return new ChatSecurityError(error, "JWT_INVALID");
  }
  if (error.includes("rate limit")) {
    return new ChatSecurityError(error, "RATE_LIMITED");
  }
  if (error.includes("Organization not found")) {
    return new ChatSecurityError(error, "ORGANIZATION_NOT_FOUND");
  }

  return new ChatSecurityError(error, "UNKNOWN");
}

/**
 * Local storage key for session data
 */
const SESSION_STORAGE_KEY = "chat_widget_session";

/**
 * Store session information in local storage
 */
export function storeSessionInfo(
  organizationId: string,
  sessionInfo: ChatSessionInfo,
): void {
  try {
    const data = {
      organizationId,
      sessionInfo,
      storedAt: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might not be available or quota exceeded
  }
}

/**
 * Retrieve session information from local storage
 */
export function getStoredSessionInfo(
  organizationId: string,
): ChatSessionInfo | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: CLaude
    const data = JSON.parse(stored);
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO: CLaude
      data.organizationId === organizationId &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO: CLaude
      data.sessionInfo?.sessionToken
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- TODO: CLaude
      return data.sessionInfo;
    }
  } catch {
    // Invalid JSON or other error
  }

  return null;
}

/**
 * Clear stored session information
 */
export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // localStorage might not be available
  }
}
