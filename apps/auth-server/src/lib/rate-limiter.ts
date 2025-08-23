interface RateLimitEntry {
  requests: number;
  resetTime: number;
}

// In-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  keyGenerator: (request: Request) => string;
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  error?: string;
  remaining: number;
  resetTime: number;
}

/**
 * Simple rate limiter implementation
 * In production, this should use a distributed cache like Redis
 */
export function rateLimit(
  request: Request,
  options: RateLimitOptions,
): RateLimitResult {
  const key = options.keyGenerator(request);
  const now = Date.now();

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to trigger cleanup
    cleanupExpiredEntries(now);
  }

  let entry = rateLimitMap.get(key);

  if (!entry || now >= entry.resetTime) {
    // Create new window
    entry = {
      requests: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitMap.set(key, entry);

    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  if (entry.requests >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: "Rate limit exceeded",
    };
  }

  // Increment request count
  entry.requests++;

  return {
    allowed: true,
    remaining: options.maxRequests - entry.requests,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request) {
  // Check for forwarded IP headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  // Fallback to connection info (may not be available in all environments)
  return "unknown";
}

/**
 * Generate rate limit key for IP-based limiting
 */
export function ipBasedKeyGenerator(request: Request): string {
  return `ip:${getClientIP(request)}`;
}

/**
 * Generate rate limit key for organization-based limiting
 */
export function orgBasedKeyGenerator(
  organizationId: string,
): (request: Request) => string {
  return () => `org:${organizationId}`;
}

/**
 * Generate rate limit key combining IP and organization
 */
export function ipOrgBasedKeyGenerator(
  organizationId: string,
): (request: Request) => string {
  return (request: Request) =>
    `ip-org:${getClientIP(request)}:${organizationId}`;
}

/**
 * Clean up expired entries from rate limit map
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Rate limit middleware for chat widget endpoints
 */
export function chatWidgetRateLimit(
  organizationId: string,
  request: Request,
): RateLimitResult {
  // Rate limit: 100 requests per organization per minute
  const orgResult = rateLimit(request, {
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
    keyGenerator: orgBasedKeyGenerator(organizationId),
  });

  if (!orgResult.allowed) {
    return orgResult;
  }

  // Additional IP-based rate limiting: 20 requests per IP per minute
  const ipResult = rateLimit(request, {
    maxRequests: 20,
    windowMs: 60_000, // 1 minute
    keyGenerator: ipBasedKeyGenerator,
  });

  return ipResult;
}
