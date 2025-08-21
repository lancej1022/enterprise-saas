/**
 * Organization Settings Management
 * Handles updating chat widget security configuration
 */

import { eq } from "drizzle-orm";

import { db } from "../db";
import * as schema from "../db/schema/auth";
import type { SecurityLevel } from "./chat-security";
import { auditConfigurationChange } from "./security-audit";

/**
 * Update organization security level
 */
export async function updateOrganizationSecurityLevel(
  organizationId: string,
  securityLevel: SecurityLevel,
  adminUserId?: string,
): Promise<{ error?: string; success: boolean }> {
  try {
    await db
      .update(schema.organizations)
      .set({
        chatSecurityLevel: securityLevel,
      })
      .where(eq(schema.organizations.id, organizationId));

    // Log configuration change
    auditConfigurationChange({
      organizationId,
      changeType: "security_level_update",
      changes: {
        securityLevel,
        previousLevel: "unknown", // TODO: Could fetch previous value if needed
      },
      adminUserId,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update security level:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Add domain to organization's allowed domains
 */
export async function addAllowedDomain(
  organizationId: string,
  domain: string,
  adminUserId?: string,
): Promise<{ error?: string; success: boolean }> {
  try {
    // First, get current domains
    const org = await db
      .select({
        chatAllowedDomains: schema.organizations.chatAllowedDomains,
      })
      .from(schema.organizations)
      .where(eq(schema.organizations.id, organizationId))
      .limit(1);

    if (!org[0]) {
      return { success: false, error: "Organization not found" };
    }

    // Parse current domains
    let currentDomains: string[] = [];
    if (org[0].chatAllowedDomains) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: validate this
        currentDomains = JSON.parse(org[0].chatAllowedDomains);
      } catch {
        currentDomains = [];
      }
    }

    // Check if domain already exists
    if (currentDomains.includes(domain)) {
      return { success: false, error: "Domain already exists" };
    }

    // Add new domain
    const updatedDomains = [...currentDomains, domain];

    // Update database
    await db
      .update(schema.organizations)
      .set({
        chatAllowedDomains: JSON.stringify(updatedDomains),
      })
      .where(eq(schema.organizations.id, organizationId));

    // Log configuration change
    auditConfigurationChange({
      organizationId,
      changeType: "domain_added",
      changes: {
        addedDomain: domain,
        totalDomains: updatedDomains.length,
      },
      adminUserId,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to add domain:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove domain from organization's allowed domains
 */
export async function removeAllowedDomain(
  organizationId: string,
  domain: string,
  adminUserId?: string,
): Promise<{ error?: string; success: boolean }> {
  try {
    // First, get current domains
    const org = await db
      .select({
        chatAllowedDomains: schema.organizations.chatAllowedDomains,
      })
      .from(schema.organizations)
      .where(eq(schema.organizations.id, organizationId))
      .limit(1);

    if (!org[0]) {
      return { success: false, error: "Organization not found" };
    }

    // Parse current domains
    let currentDomains: string[] = [];
    if (org[0].chatAllowedDomains) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: validate this
        currentDomains = JSON.parse(org[0].chatAllowedDomains);
      } catch {
        currentDomains = [];
      }
    }

    // Check if domain exists
    if (!currentDomains.includes(domain)) {
      return { success: false, error: "Domain not found" };
    }

    // Remove domain
    const updatedDomains = currentDomains.filter((d) => d !== domain);

    // Update database
    await db
      .update(schema.organizations)
      .set({
        chatAllowedDomains: JSON.stringify(updatedDomains),
      })
      .where(eq(schema.organizations.id, organizationId));

    // Log configuration change
    auditConfigurationChange({
      organizationId,
      changeType: "domain_removed",
      changes: {
        removedDomain: domain,
        totalDomains: updatedDomains.length,
      },
      adminUserId,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove domain:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate or rotate JWT secret for organization
 */
export async function rotateJWTSecret(
  organizationId: string,
  adminUserId?: string,
): Promise<{ error?: string; secret?: string; success: boolean }> {
  try {
    // Generate new secret (32 bytes = 256 bits)
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Update database
    await db
      .update(schema.organizations)
      .set({
        chatJwtSecret: secret,
      })
      .where(eq(schema.organizations.id, organizationId));

    // Log configuration change
    auditConfigurationChange({
      organizationId,
      changeType: "jwt_secret_rotation",
      changes: {
        secretRotated: true,
        timestamp: new Date().toISOString(),
      },
      adminUserId,
    });

    return { success: true, secret };
  } catch (error) {
    console.error("Failed to rotate JWT secret:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
