import crypto from "crypto";
import { eq } from "drizzle-orm";
import * as jose from "jose";

import { db } from "../db";
import * as schema from "../db/schema/auth";

export interface ChatJWTPayload {
  // Index signature to satisfy JWTPayload interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: Claude lol
  [key: string]: any;
  aud: string; // Audience (your service)
  exp: number; // Expiration time
  iat: number; // Issued at
  iss: string; // Issuer (customer domain)
  org_id: string; // Organization ID
  sub: string; // Subject (customer user ID)
  user_data?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: Claude lol
    custom_fields?: Record<string, any>;
    email?: string;
    name?: string;
  };
}

/**
 * Generate a JWT secret for an organization
 */
export function generateJWTSecret(): string {
  return crypto.randomBytes(32).toString("base64");
}

/**
 * Update organization with a new JWT secret
 */
export async function updateOrganizationJWTSecret(
  organizationId: string,
): Promise<string> {
  const secret = generateJWTSecret();

  await db
    .update(schema.organizations)
    .set({ chatJwtSecret: secret })
    .where(eq(schema.organizations.id, organizationId));

  return secret;
}

/**
 * Create a sample JWT for testing (this would be used by customers)
 */
// eslint-disable-next-line max-params -- TODO: Claude lol
export async function createSampleChatJWT(
  organizationId: string,
  userIdentifier: string,
  domain: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: Claude lol
  userData?: any,
): Promise<string> {
  // Get the organization's JWT secret
  const org = await db
    .select({ chatJwtSecret: schema.organizations.chatJwtSecret })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, organizationId))
    .limit(1);

  if (!org[0]?.chatJwtSecret) {
    throw new Error("JWT secret not configured for organization");
  }

  const secret = new TextEncoder().encode(org[0].chatJwtSecret);
  const now = Math.floor(Date.now() / 1000);

  const payload: ChatJWTPayload = {
    iss: domain,
    aud: "chat-widget",
    sub: userIdentifier,
    exp: now + 900, // 15 minutes
    iat: now,
    org_id: organizationId,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: Claude lol
    user_data: userData,
  };

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);

  return jwt;
}

/**
 * Validate JWT structure (for testing/debugging)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: Claude lol
export function decodeJWT(token: string): any {
  try {
    return jose.decodeJwt(token);
  } catch (error) {
    throw new Error("Invalid JWT format");
  }
}

/**
 * Generate JWT documentation for customers
 */
export function generateJWTDocumentation(organizationId: string): {
  algorithm: string;
  examplePayload: ChatJWTPayload;
  optionalClaims: string[];
  requiredClaims: string[];
} {
  const now = Math.floor(Date.now() / 1000);

  return {
    algorithm: "HS256",
    requiredClaims: ["iss", "aud", "sub", "exp", "org_id"],
    optionalClaims: ["iat", "user_data"],
    examplePayload: {
      iss: "https://your-domain.com",
      aud: "chat-widget",
      sub: "customer-user-123",
      exp: now + 900,
      iat: now,
      org_id: organizationId,
      user_data: {
        name: "John Doe",
        email: "john@your-domain.com",
        custom_fields: {
          department: "support",
          tier: "premium",
        },
      },
    },
  };
}
