/**
 * Security Audit Logging System
 * Comprehensive logging for security events, compliance, and monitoring
 */

interface SecurityEvent {
  details: Record<string, unknown>;
  domain?: string;
  eventType: SecurityEventType;
  ip?: string;
  organizationId: string;
  outcome: "failure" | "success" | "warning";
  requestId?: string;
  severity: SecuritySeverity;
  timestamp: string;
  userAgent?: string;
  userIdentifier?: string;
}

type SecurityEventType =
  | "chat_widget_init"
  | "configuration_access"
  | "domain_validation"
  | "jwt_validation"
  | "rate_limit_exceeded"
  | "secret_generation"
  | "secret_rotation"
  | "security_policy_change"
  | "session_creation"
  | "session_validation"
  | "suspicious_activity"
  | "unauthorized_access";

type SecuritySeverity = "critical" | "high" | "low" | "medium";

/**
 * Security audit logger class
 */
class SecurityAuditLogger {
  private logQueue: SecurityEvent[] = [];
  private readonly maxQueueSize = 1000;
  private readonly flushInterval = 5000; // 5 seconds

  constructor() {
    // Start periodic flush
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Log a security event
   */
  public logEvent(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.logQueue.push(fullEvent);

    // Immediate flush for critical events
    if (event.severity === "critical") {
      this.flush();
    }

    // Prevent memory leaks by limiting queue size
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue = this.logQueue.slice(-this.maxQueueSize);
    }

    // Log to console immediately for development
    this.logToConsole(fullEvent);
  }

  /**
   * Log successful chat widget initialization
   */
  public logChatWidgetInit(data: {
    domain?: string;
    ip?: string;
    organizationId: string;
    requestId?: string;
    securityLevel: string;
    sessionToken: string;
    userAgent?: string;
    userIdentifier?: string;
  }): void {
    this.logEvent({
      eventType: "chat_widget_init",
      organizationId: data.organizationId,
      userIdentifier: data.userIdentifier,
      domain: data.domain,
      ip: data.ip,
      userAgent: data.userAgent,
      requestId: data.requestId,
      severity: "low",
      outcome: "success",
      details: {
        securityLevel: data.securityLevel,
        sessionToken: data.sessionToken.substring(0, 8) + "...", // Truncate for security
        hasUserIdentifier: !!data.userIdentifier,
      },
    });
  }

  /**
   * Log JWT validation events
   */
  public logJWTValidation(data: {
    domain?: string;
    error?: string;
    ip?: string;
    organizationId: string;
    outcome: "failure" | "success";
    requestId?: string;
    userAgent?: string;
    userIdentifier?: string;
  }): void {
    this.logEvent({
      eventType: "jwt_validation",
      organizationId: data.organizationId,
      userIdentifier: data.userIdentifier,
      domain: data.domain,
      ip: data.ip,
      userAgent: data.userAgent,
      requestId: data.requestId,
      severity: data.outcome === "failure" ? "medium" : "low",
      outcome: data.outcome,
      details: {
        error: data.error,
        hasUserIdentifier: !!data.userIdentifier,
      },
    });
  }

  /**
   * Log domain validation events
   */
  public logDomainValidation(data: {
    allowedDomains: string[];
    ip?: string;
    organizationId: string;
    outcome: "failure" | "success";
    requestDomain: string;
    requestId?: string;
    userAgent?: string;
  }): void {
    this.logEvent({
      eventType: "domain_validation",
      organizationId: data.organizationId,
      domain: data.requestDomain,
      ip: data.ip,
      userAgent: data.userAgent,
      requestId: data.requestId,
      severity: data.outcome === "failure" ? "high" : "low",
      outcome: data.outcome,
      details: {
        requestDomain: data.requestDomain,
        allowedDomains: data.allowedDomains,
        domainCount: data.allowedDomains.length,
      },
    });
  }

  /**
   * Log rate limiting events
   */
  public logRateLimit(data: {
    ip?: string;
    organizationId: string;
    remaining: number;
    requestId?: string;
    resetTime: number;
    userAgent?: string;
  }): void {
    this.logEvent({
      eventType: "rate_limit_exceeded",
      organizationId: data.organizationId,
      ip: data.ip,
      userAgent: data.userAgent,
      requestId: data.requestId,
      severity: "medium",
      outcome: "warning",
      details: {
        remaining: data.remaining,
        resetTime: data.resetTime,
        resetTimeFormatted: new Date(data.resetTime).toISOString(),
      },
    });
  }

  /**
   * Log unauthorized access attempts
   */
  public logUnauthorizedAccess(data: {
    attemptedAction: string;
    domain?: string;
    ip?: string;
    organizationId?: string;
    reason: string;
    requestId?: string;
    userAgent?: string;
  }): void {
    this.logEvent({
      eventType: "unauthorized_access",
      organizationId: data.organizationId || "unknown",
      ip: data.ip,
      userAgent: data.userAgent,
      domain: data.domain,
      requestId: data.requestId,
      severity: "high",
      outcome: "failure",
      details: {
        attemptedAction: data.attemptedAction,
        reason: data.reason,
      },
    });
  }

  /**
   * Log suspicious activities
   */
  public logSuspiciousActivity(data: {
    activity: string;
    domain?: string;
    indicators: string[];
    ip?: string;
    organizationId: string;
    requestId?: string;
    riskLevel: SecuritySeverity;
    userAgent?: string;
  }): void {
    this.logEvent({
      eventType: "suspicious_activity",
      organizationId: data.organizationId,
      ip: data.ip,
      userAgent: data.userAgent,
      domain: data.domain,
      requestId: data.requestId,
      severity: data.riskLevel,
      outcome: "warning",
      details: {
        activity: data.activity,
        indicators: data.indicators,
        indicatorCount: data.indicators.length,
      },
    });
  }

  /**
   * Log configuration changes
   */
  public logConfigurationChange(data: {
    adminUserId?: string;
    changes: Record<string, unknown>;
    changeType: string;
    ip?: string;
    organizationId: string;
    requestId?: string;
    userAgent?: string;
  }): void {
    this.logEvent({
      eventType: "security_policy_change",
      organizationId: data.organizationId,
      userIdentifier: data.adminUserId,
      ip: data.ip,
      userAgent: data.userAgent,
      requestId: data.requestId,
      severity: "medium",
      outcome: "success",
      details: {
        changeType: data.changeType,
        changes: data.changes,
        hasAdminUser: !!data.adminUserId,
      },
    });
  }

  /**
   * Flush logs to persistent storage
   * In production, this should send to your logging service (e.g., DataDog, Splunk, etc.)
   */
  private flush(): void {
    if (this.logQueue.length === 0) return;

    const events = [...this.logQueue];
    this.logQueue = [];

    // In production, replace this with actual log shipping
    // Examples:
    // - Send to DataDog: await this.sendToDataDog(events);
    // - Send to Splunk: await this.sendToSplunk(events);
    // - Send to CloudWatch: await this.sendToCloudWatch(events);
    // - Store in database: await this.storeInDatabase(events);

    // For now, just console log aggregated info
    if (events.length > 0) {
      const summary = this.createEventSummary(events);
      // eslint-disable-next-line no-console -- TODO: create better logging system
      console.info("[AUDIT] Security events summary:", summary);
    }
  }

  /**
   * Log to console for immediate visibility
   */
  private logToConsole(event: SecurityEvent): void {
    const logLevel = this.getLogLevel(event.severity);
    const message = `[SECURITY AUDIT] ${event.eventType.toUpperCase()} - ${event.outcome.toUpperCase()}`;

    const logData = {
      organizationId: event.organizationId,
      userIdentifier: event.userIdentifier,
      domain: event.domain,
      ip: event.ip,
      severity: event.severity,
      details: event.details,
    };

    switch (logLevel) {
      case "error":
        console.error(message, logData);
        break;
      case "warn":
        // eslint-disable-next-line no-console -- TODO: create better logging system
        console.warn(message, logData);
        break;
      default:
        // eslint-disable-next-line no-console -- TODO: create better logging system
        console.info(message, logData);
    }
  }

  /**
   * Get appropriate log level based on severity
   */
  private getLogLevel(severity: SecuritySeverity): "error" | "info" | "warn" {
    switch (severity) {
      case "critical":
      case "high":
        return "error";
      case "medium":
        return "warn";
      default:
        return "info";
    }
  }

  /**
   * Create summary of events for batch logging
   */
  private createEventSummary(events: SecurityEvent[]): Record<string, unknown> {
    const summary = {
      totalEvents: events.length,
      timeRange: {
        start: events[0]?.timestamp,
        end: events[events.length - 1]?.timestamp,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO
      eventTypes: {} as Record<string, number>,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO
      severityBreakdown: {} as Record<SecuritySeverity, number>,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO
      outcomeBreakdown: {} as Record<string, number>,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO
      organizationBreakdown: {} as Record<string, number>,
    };

    events.forEach((event) => {
      // Count event types
      summary.eventTypes[event.eventType] =
        (summary.eventTypes[event.eventType] || 0) + 1;

      // Count severities
      summary.severityBreakdown[event.severity] =
        (summary.severityBreakdown[event.severity] || 0) + 1;

      // Count outcomes
      summary.outcomeBreakdown[event.outcome] =
        (summary.outcomeBreakdown[event.outcome] || 0) + 1;

      // Count organizations
      summary.organizationBreakdown[event.organizationId] =
        (summary.organizationBreakdown[event.organizationId] || 0) + 1;
    });

    return summary;
  }
}

// Export singleton instance
const securityAudit = new SecurityAuditLogger();

// Export convenience functions
export const auditChatWidgetInit =
  securityAudit.logChatWidgetInit.bind(securityAudit);
export const auditJWTValidation =
  securityAudit.logJWTValidation.bind(securityAudit);

export const auditRateLimit = securityAudit.logRateLimit.bind(securityAudit);
export const auditUnauthorizedAccess =
  securityAudit.logUnauthorizedAccess.bind(securityAudit);

export const auditConfigurationChange =
  securityAudit.logConfigurationChange.bind(securityAudit);
