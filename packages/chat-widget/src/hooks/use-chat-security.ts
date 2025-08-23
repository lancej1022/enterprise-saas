import { useCallback, useEffect, useState } from "react";

import {
  clearStoredSession,
  getOrganizationConfig,
  getStoredSessionInfo,
  initializeChatSecurity,
  parseSecurityError,
  storeSessionInfo,
  validateSession,
} from "../lib/security";
import type {
  ChatSessionInfo,
  ChatWidgetSecurityConfig,
} from "../lib/security";

export interface UseChatSecurityOptions {
  autoRetry?: boolean;
  domain?: string; // Optional domain override
  onSecurityError?: (error: string, code: string) => void;
  organizationId: string;
  userJWT?: string;
}

export interface ChatSecurityState {
  clearSession: () => void;
  error: null | string;
  // Actions
  initialize: () => Promise<void>;
  // Security status
  isInitialized: boolean;

  isLoading: boolean;

  retry: () => Promise<void>;
  securityLevel: "basic" | "jwt_required" | null;
  // Session information
  sessionInfo: ChatSessionInfo | null;
}

/**
 * Hook for managing chat widget security and session state
 */
export function useChatSecurity({
  organizationId,
  userJWT,
  domain,
  onSecurityError,
  autoRetry = false,
}: UseChatSecurityOptions): ChatSecurityState {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [securityLevel, setSecurityLevel] = useState<
    "basic" | "jwt_required" | null
  >(null);
  const [sessionInfo, setSessionInfo] = useState<ChatSessionInfo | null>(null);

  const clearSession = useCallback(() => {
    setSessionInfo(null);
    setIsInitialized(false);
    setError(null);
    clearStoredSession();
  }, []);

  const initialize = useCallback(async () => {
    if (!organizationId) {
      setError("Organization ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, get organization configuration
      const configResult = await getOrganizationConfig(organizationId);

      if (!configResult.success) {
        throw new Error(
          configResult.error || "Failed to get organization config",
        );
      }

      const config = configResult.config;
      if (!config) {
        throw new Error("Failed to get organization config");
      }

      setSecurityLevel(config.securityLevel);

      // Check if we need JWT but don't have it
      if (config.securityLevel === "jwt_required" && !userJWT) {
        throw new Error("JWT authentication is required for this organization");
      }

      // Try to use stored session first
      const storedSession = getStoredSessionInfo(organizationId);
      if (storedSession?.sessionToken) {
        // Validate stored session
        const validationResult = await validateSession(
          storedSession.sessionToken,
        );

        if (validationResult.valid) {
          setSessionInfo(storedSession);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        } else {
          // Clear invalid stored session
          clearStoredSession();
        }
      }

      // Initialize new security session
      const securityConfig: ChatWidgetSecurityConfig = {
        organizationId,
        userJWT,
        domain, // Pass domain override if provided
      };

      const result = await initializeChatSecurity(securityConfig);

      if (!result.success) {
        const securityError = parseSecurityError(
          result.error || "Unknown error",
        );
        throw securityError;
      }

      if (result.sessionInfo) {
        setSessionInfo(result.sessionInfo);
        storeSessionInfo(organizationId, result.sessionInfo);
        setIsInitialized(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Security initialization failed";
      setError(errorMessage);

      // Determine error code for callback
      const securityError = parseSecurityError(errorMessage);
      onSecurityError?.(errorMessage, securityError.code);

      // Auto-retry for certain errors
      if (autoRetry && securityError.code === "RATE_LIMITED") {
        setTimeout(() => {
          void initialize();
        }, 5000); // Retry after 5 seconds
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/react-compiler -- TODO
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: fix
  }, [organizationId, userJWT, onSecurityError, autoRetry]);

  const retry = useCallback(async () => {
    clearSession();
    await initialize();
  }, [clearSession, initialize]);

  // Auto-initialize on mount or when dependencies change
  useEffect(() => {
    if (organizationId && !isInitialized && !isLoading) {
      void initialize();
    }
  }, [organizationId, initialize, isInitialized, isLoading]);

  return {
    isInitialized,
    isLoading,
    error,
    securityLevel,
    sessionInfo,
    initialize,
    retry,
    clearSession,
  };
}
