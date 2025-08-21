import { eq, lt } from "drizzle-orm";
import * as jose from "jose";

import { db } from "../db";
import * as schema from "../db/schema/auth";

export type SecurityLevel = "basic" | "jwt_required";

export interface ChatSecurityConfig {
  allowedDomains: string[];
  jwtSecret?: string;
  securityLevel: SecurityLevel;
  sessionDuration: number;
}

export interface ValidationResult {
  error?: string;
  sessionToken?: string;
  success: boolean;
  userIdentifier?: null | string;
}

/**
 * Standard JWT payload structure for chat widget authentication
 */
export interface ChatWidgetJWTPayload {
  /** Standard JWT audience - your chat service identifier */
  aud: string;
  /** Standard JWT expiration time (Unix timestamp) */
  exp: number;
  /** Standard JWT issued at time (Unix timestamp) */
  iat?: number;
  /** Standard JWT issuer - should be customer's domain */
  iss: string;
  /** JWT ID for replay attack prevention (nonce) */
  jti?: string;
  /** Standard JWT not before time (Unix timestamp) */
  nbf?: number;
  /** Organization identifier */
  org_id: string;
  /** Standard JWT subject - customer's user ID */
  sub: string;
  /** User data for the chat session */
  user_data?: {
    [key: string]: unknown;
    avatar?: string;
    email?: string;
    name?: string;
  };
}

/**
 * Get security configuration for an organization
 */
export async function getOrganizationSecurity(
  organizationId: string,
): Promise<ChatSecurityConfig | null> {
  const org = await db
    .select({
      chatSecurityLevel: schema.organizations.chatSecurityLevel,
      chatAllowedDomains: schema.organizations.chatAllowedDomains,
      chatJwtSecret: schema.organizations.chatJwtSecret,
      chatSessionDuration: schema.organizations.chatSessionDuration,
    })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, organizationId))
    .limit(1);

  if (!org[0]) return null;

  const config = org[0];
  return {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/consistent-type-assertions -- TODO: fix this
    securityLevel: (config.chatSecurityLevel as SecurityLevel) || "basic",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: fix this
    allowedDomains: config.chatAllowedDomains
      ? JSON.parse(config.chatAllowedDomains)
      : [],
    jwtSecret: config.chatJwtSecret || undefined,
    sessionDuration: config.chatSessionDuration || 900_000, // 15 minutes default
  };
}

/**
 * Validate domain against organization's allowed domains
 */
export function validateDomain(
  domain: string,
  allowedDomains: string[],
): boolean {
  if (allowedDomains.length === 0) {
    // If no domains configured, allow all (backward compatibility)
    return true;
  }

  // Normalize domain (remove protocol, port, trailing slash)
  const normalizedDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/:\d+$/, "")
    .replace(/\/$/, "")
    .toLowerCase();

  return allowedDomains.some((allowedDomain) => {
    const normalizedAllowed = allowedDomain.toLowerCase();

    // Exact match
    if (normalizedDomain === normalizedAllowed) return true;

    // Wildcard subdomain match (e.g., *.example.com matches app.example.com)
    if (normalizedAllowed.startsWith("*.")) {
      const baseDomain = normalizedAllowed.slice(2);
      return (
        normalizedDomain === baseDomain ||
        normalizedDomain.endsWith("." + baseDomain)
      );
    }

    return false;
  });
}

/**
 * Extract domain from request headers
 */
export function getDomainFromRequest(request: Request): null | string {
  // Try Origin header first (more reliable)
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).hostname;
    } catch {
      // Invalid URL, fall through
    }
  }

  // Fall back to Referer header
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).hostname;
    } catch {
      // Invalid URL
    }
  }

  return null;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomUUID() + "_" + Date.now().toString(36);
}

/**
 * Create a chat session
 */
// eslint-disable-next-line max-params -- TODO: fix this
export async function createChatSession(
  organizationId: string,
  domain: null | string,
  userIdentifier: null | string,
  sessionDuration: number,
): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + sessionDuration);

  await db.insert(schema.chatSessions).values({
    id: crypto.randomUUID(),
    organizationId,
    sessionToken,
    userIdentifier,
    domain,
    expiresAt,
  });

  return sessionToken;
}

/**
 * Track used JWTs to prevent replay attacks
 * In production, this should be replaced with Redis or database storage
 */
const usedJTIs = new Set<string>();

/**
 * Validate JWT for chat widget with comprehensive security checks
 */
// eslint-disable-next-line max-params -- TODO: Claude lol
export async function validateChatJWT(
  token: string,
  secret: string,
  organizationId: string,
  domain?: null | string,
): Promise<{ error?: string; payload?: ChatWidgetJWTPayload; valid: boolean }> {
  try {
    // Create HMAC key from secret
    const key = new TextEncoder().encode(secret);

    // Verify JWT signature and basic structure
    const { payload: rawPayload } = await jose.jwtVerify(token, key, {
      algorithms: ["HS256"],
      audience: "chat-widget", // Expected audience
    });

    // Cast to our expected payload structure
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: Claude lol
    const payload = rawPayload as unknown as ChatWidgetJWTPayload;

    // 1. Validate required fields
    if (!payload.sub) {
      return { valid: false, error: "Missing user identifier (sub)" };
    }

    if (!payload.iss) {
      return { valid: false, error: "Missing issuer (iss)" };
    }

    if (!payload.aud || payload.aud !== "chat-widget") {
      return { valid: false, error: "Invalid or missing audience (aud)" };
    }

    if (!payload.org_id) {
      return { valid: false, error: "Missing organization ID (org_id)" };
    }

    // 2. Validate organization ID matches
    if (payload.org_id !== organizationId) {
      return { valid: false, error: "Organization ID mismatch" };
    }

    // 3. Validate expiration time
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp) {
      return { valid: false, error: "Missing expiration time (exp)" };
    }

    if (payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }

    // Recommend 5-15 minutes max for security
    const maxExpiration = now + 15 * 60; // 15 minutes from now
    if (payload.exp > maxExpiration) {
      return {
        valid: false,
        error: "Token expiration time too far in future (max 15 minutes)",
      };
    }

    // 4. Validate issued at time (iat) if present
    if (payload.iat) {
      if (payload.iat > now) {
        return { valid: false, error: "Token issued in the future (iat)" };
      }
      // Allow some clock skew (5 minutes)
      if (now - payload.iat > 300) {
        return { valid: false, error: "Token issued too long ago (iat)" };
      }
    }

    // 5. Validate not before time (nbf) if present
    if (payload.nbf && payload.nbf > now) {
      return { valid: false, error: "Token not yet valid (nbf)" };
    }

    // 6. Validate issuer matches domain (if domain provided)
    if (domain) {
      const issuerDomain = payload.iss
        .replace(/^https?:\/\//, "")
        .replace(/:\d+$/, "")
        .toLowerCase();
      const requestDomain = domain.toLowerCase();

      if (issuerDomain !== requestDomain) {
        return {
          valid: false,
          error: `JWT issuer domain '${issuerDomain}' does not match request domain '${requestDomain}'`,
        };
      }
    }

    // 7. Replay attack prevention using JTI (JWT ID)
    if (payload.jti) {
      if (usedJTIs.has(payload.jti)) {
        return {
          valid: false,
          error: "Token has already been used (replay attack prevented)",
        };
      }
      // Mark this JTI as used
      usedJTIs.add(payload.jti);

      // Clean up old JTIs periodically (simple in-memory cleanup)
      // In production, use Redis with TTL or database with cleanup job
      if (usedJTIs.size > 10_000) {
        usedJTIs.clear(); // Simple cleanup - in prod, use more sophisticated approach
      }
    }

    return { valid: true, payload };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "JWT validation failed",
    };
  }
}

/**
 * Validate chat widget initialization request
 */
export async function validateChatWidgetInit(
  organizationId: string,
  request: Request,
  userJWT?: string,
): Promise<ValidationResult> {
  // Get organization security config
  const config = await getOrganizationSecurity(organizationId);
  if (!config) {
    return { success: false, error: "Organization not found" };
  }

  // Extract domain from request
  const domain = getDomainFromRequest(request);

  // Basic domain validation (applies to both security levels)
  if (config.allowedDomains.length > 0) {
    if (!domain) {
      return { success: false, error: "Unable to determine request domain" };
    }

    if (!validateDomain(domain, config.allowedDomains)) {
      return {
        success: false,
        error: `Domain '${domain}' is not authorized for this widget`,
      };
    }
  }

  let userIdentifier: null | string = null;

  // JWT validation (if required or provided)
  if (config.securityLevel === "jwt_required" || userJWT) {
    if (!userJWT) {
      return {
        success: false,
        error: "JWT authentication required for this organization",
      };
    }

    if (!config.jwtSecret) {
      return {
        success: false,
        error: "JWT secret not configured for organization",
      };
    }

    const jwtResult = await validateChatJWT(
      userJWT,
      config.jwtSecret,
      organizationId,
      domain,
    );

    if (!jwtResult.valid) {
      return { success: false, error: jwtResult.error };
    }

    userIdentifier = jwtResult.payload?.sub || null;
  }

  // Create session
  const sessionToken = await createChatSession(
    organizationId,
    domain,
    userIdentifier,
    config.sessionDuration,
  );

  return {
    success: true,
    sessionToken,
    userIdentifier,
  };
}

/**
 * Validate an existing chat session
 */
export async function validateChatSession(sessionToken: string): Promise<{
  organizationId?: string;
  userIdentifier?: string;
  valid: boolean;
}> {
  const session = await db
    .select()
    .from(schema.chatSessions)
    .where(eq(schema.chatSessions.sessionToken, sessionToken))
    .limit(1);

  if (!session[0]) {
    return { valid: false };
  }

  const sessionData = session[0];

  // Check if session is expired
  if (sessionData.expiresAt < new Date()) {
    // Clean up expired session
    await db
      .delete(schema.chatSessions)
      .where(eq(schema.chatSessions.sessionToken, sessionToken));

    return { valid: false };
  }

  return {
    valid: true,
    organizationId: sessionData.organizationId,
    // @ts-expect-error -- TODO: fix this
    userIdentifier: sessionData.userIdentifier,
  };
}

/**
 * Clean up expired sessions (should be called periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date();

  // Delete sessions that have expired
  await db
    .delete(schema.chatSessions)
    .where(lt(schema.chatSessions.expiresAt, now));

  // Note: The exact way to get affected rows count depends on the database driver
  // For now, we'll return 0 as a placeholder since Drizzle doesn't always return count
  return 0; // TODO: Implement proper count if needed
}
