import { z } from "zod/v4";

import {
  getOrganizationSecurity,
  validateChatWidgetInit,
} from "../lib/chat-security";
import {
  createSampleChatJWT,
  generateJWTDocumentation,
} from "../lib/jwt-utils";
import {
  addAllowedDomain,
  removeAllowedDomain,
  rotateJWTSecret,
  updateOrganizationSecurityLevel,
} from "../lib/organization-settings";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { chatWidgetRateLimit } from "../lib/rate-limiter";
import { runManualCleanup } from "../lib/scheduled-tasks";
import {
  auditChatWidgetInit,
  auditJWTValidation,
  auditRateLimit,
  auditUnauthorizedAccess,
} from "../lib/security-audit";

const initChatWidgetSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userJWT: z.string().optional(),
  domain: z.string().optional(),
});

const getConfigSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const generateSecretSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const createSampleJWTSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userIdentifier: z.string().min(1, "User identifier is required"),
  domain: z.string().min(1, "Domain is required"),
  userData: z.record(z.any(), z.any()).optional(),
});

const getJWTDocsSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const validateSessionSchema = z.object({
  sessionToken: z.string().min(1, "Session token is required"),
});

const validateJWTSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userJWT: z.string().min(1, "JWT token is required"),
  domain: z.string().optional(),
});

const updateSecurityLevelSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  securityLevel: z.enum(["basic", "jwt_required"]),
});

const addDomainSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  domain: z.string().min(1, "Domain is required"),
});

const removeDomainSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  domain: z.string().min(1, "Domain is required"),
});

export const chatRouter = {
  /**
   * Initialize a chat widget session
   */
  init: publicProcedure
    .input(initChatWidgetSchema)
    .handler(async ({ input, context }) => {
      const { organizationId, userJWT } = input;

      // Apply rate limiting
      const rateLimitResult = chatWidgetRateLimit(
        organizationId,
        context.request,
      );
      if (!rateLimitResult.allowed) {
        // Log rate limit violation
        auditRateLimit({
          organizationId,
          ip:
            context.request.headers.get("x-forwarded-for") ||
            context.request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: context.request.headers.get("user-agent") || "unknown",
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        });
        throw new Error(rateLimitResult.error || "Rate limit exceeded");
      }

      // Validate the chat widget initialization
      const result = await validateChatWidgetInit(
        organizationId,
        context.request,
        userJWT,
      );

      if (!result.success) {
        // Log failed initialization
        auditUnauthorizedAccess({
          organizationId,
          attemptedAction: "chat_widget_init",
          reason: result.error || "Unknown error",
          ip:
            context.request.headers.get("x-forwarded-for") ||
            context.request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: context.request.headers.get("user-agent") || "unknown",
        });
        throw new Error(result.error || "Chat widget initialization failed");
      }

      // Log successful initialization
      auditChatWidgetInit({
        organizationId,
        userIdentifier: result.userIdentifier || undefined,
        securityLevel: "determined_by_validation", // Will be enhanced with actual security level
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: fix this
        sessionToken: result.sessionToken!,
        ip:
          context.request.headers.get("x-forwarded-for") ||
          context.request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: context.request.headers.get("user-agent") || "unknown",
      });

      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: fix this
        sessionToken: result.sessionToken!,
        userIdentifier: result.userIdentifier,
        message: "Chat widget initialized successfully",
        rateLimitInfo: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      };
    }),

  /**
   * Get chat widget configuration for an organization
   */
  getConfig: publicProcedure
    .input(getConfigSchema)
    .handler(async ({ input }) => {
      const { organizationId } = input;

      const config = await getOrganizationSecurity(organizationId);

      if (!config) {
        throw new Error("Organization not found");
      }

      // Return only public configuration (don't expose JWT secret)
      return {
        organizationId,
        securityLevel: config.securityLevel,
        allowedDomains: config.allowedDomains,
        sessionDuration: config.sessionDuration,
      };
    }),

  /**
   * Generate a new JWT secret for an organization (protected endpoint)
   */
  generateSecret: protectedProcedure
    .input(generateSecretSchema)
    .handler(async ({ input, context }) => {
      const { organizationId } = input;

      const result = await rotateJWTSecret(
        organizationId,
        context.session.user.id,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to generate JWT secret");
      }

      return {
        success: true,
        message: "JWT secret generated successfully",
        // Return only partial secret for security
        secretPreview: result.secret
          ? `${result.secret.substring(0, 8)}...`
          : "Generated",
      };
    }),

  /**
   * Create a sample JWT for testing (protected endpoint)
   */
  createSampleJWT: protectedProcedure
    .input(createSampleJWTSchema)
    .handler(async ({ input }) => {
      const { organizationId, userIdentifier, domain, userData } = input;

      const jwt = await createSampleChatJWT(
        organizationId,
        userIdentifier,
        domain,
        userData,
      );

      return {
        success: true,
        jwt,
        expiresIn: "15 minutes",
      };
    }),

  /**
   * Get JWT implementation documentation
   */
  getJWTDocs: publicProcedure.input(getJWTDocsSchema).handler(({ input }) => {
    const { organizationId } = input;

    const docs = generateJWTDocumentation(organizationId);

    return {
      ...docs,
      instructions: {
        overview: "Generate JWTs server-side using your organization's secret",
        steps: [
          "Include required claims: iss, aud, sub, exp, org_id",
          "Sign with HS256 algorithm using your JWT secret",
          "Set expiration time (recommended: 5-15 minutes)",
          "Pass JWT to widget initialization",
        ],
        security: [
          "Never expose JWT secret in client-side code",
          "Generate JWTs server-side only",
          "Use short expiration times",
          "Validate issuer matches request domain",
        ],
      },
    };
  }),

  /**
   * Validate an existing chat session token
   */
  validateSession: publicProcedure
    .input(validateSessionSchema)
    .handler(async ({ input }) => {
      const { sessionToken } = input;

      const { validateChatSession } = await import("../lib/chat-security");
      const result = await validateChatSession(sessionToken);

      return {
        valid: result.valid,
        organizationId: result.organizationId,
        userIdentifier: result.userIdentifier,
      };
    }),

  /**
   * Validate JWT token and create session (standalone JWT validation endpoint)
   */
  validateJWT: publicProcedure
    .input(validateJWTSchema)
    .handler(async ({ input, context }) => {
      const { organizationId, userJWT, domain } = input;

      // Apply rate limiting
      const rateLimitResult = chatWidgetRateLimit(
        organizationId,
        context.request,
      );
      if (!rateLimitResult.allowed) {
        // Log rate limit violation for JWT validation
        auditRateLimit({
          organizationId,
          ip:
            context.request.headers.get("x-forwarded-for") ||
            context.request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: context.request.headers.get("user-agent") || "unknown",
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        });
        throw new Error(rateLimitResult.error || "Rate limit exceeded");
      }

      // Get organization security config
      const config = await getOrganizationSecurity(organizationId);
      if (!config) {
        throw new Error("Organization not found");
      }

      if (!config.jwtSecret) {
        throw new Error("JWT secret not configured for organization");
      }

      // Validate JWT
      const { validateChatJWT } = await import("../lib/chat-security");
      const jwtResult = await validateChatJWT(
        userJWT,
        config.jwtSecret,
        organizationId,
        domain,
      );

      if (!jwtResult.valid) {
        // Log failed JWT validation
        auditJWTValidation({
          organizationId,
          domain,
          outcome: "failure",
          error: jwtResult.error,
          ip:
            context.request.headers.get("x-forwarded-for") ||
            context.request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: context.request.headers.get("user-agent") || "unknown",
        });
        throw new Error(jwtResult.error || "JWT validation failed");
      }

      // Log successful JWT validation
      auditJWTValidation({
        organizationId,
        userIdentifier: jwtResult.payload?.sub,
        domain,
        outcome: "success",
        ip:
          context.request.headers.get("x-forwarded-for") ||
          context.request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: context.request.headers.get("user-agent") || "unknown",
      });

      // Create session if JWT is valid
      const { createChatSession } = await import("../lib/chat-security");
      const sessionToken = await createChatSession(
        organizationId,
        domain || null,
        jwtResult.payload?.sub || null,
        config.sessionDuration,
      );

      return {
        success: true,
        sessionToken,
        userIdentifier: jwtResult.payload?.sub,
        userData: jwtResult.payload?.user_data,
        message: "JWT validated and session created successfully",
        rateLimitInfo: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      };
    }),

  /**
   * Manual cleanup of expired sessions (protected endpoint)
   */
  cleanup: protectedProcedure.handler(async () => {
    const result = await runManualCleanup();

    if (!result.success) {
      throw new Error(result.error || "Cleanup failed");
    }

    return result;
  }),

  /**
   * Update organization security level (protected endpoint)
   */
  updateSecurityLevel: protectedProcedure
    .input(updateSecurityLevelSchema)
    .handler(async ({ input, context }) => {
      const { organizationId, securityLevel } = input;

      const result = await updateOrganizationSecurityLevel(
        organizationId,
        securityLevel,
        context.session.user.id,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update security level");
      }

      return {
        success: true,
        message: `Security level updated to ${securityLevel}`,
        securityLevel,
      };
    }),

  /**
   * Add allowed domain (protected endpoint)
   */
  addDomain: protectedProcedure
    .input(addDomainSchema)
    .handler(async ({ input, context }) => {
      const { organizationId, domain } = input;

      const result = await addAllowedDomain(
        organizationId,
        domain,
        context.session.user.id,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to add domain");
      }

      return {
        success: true,
        message: `Domain ${domain} added successfully`,
        domain,
      };
    }),

  /**
   * Remove allowed domain (protected endpoint)
   */
  removeDomain: protectedProcedure
    .input(removeDomainSchema)
    .handler(async ({ input, context }) => {
      const { organizationId, domain } = input;

      const result = await removeAllowedDomain(
        organizationId,
        domain,
        context.session.user.id,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to remove domain");
      }

      return {
        success: true,
        message: `Domain ${domain} removed successfully`,
        domain,
      };
    }),

  /**
   * Health check endpoint
   */
  healthCheck: publicProcedure.handler(() => {
    return { status: "ok", service: "chat-widget" };
  }),
};
