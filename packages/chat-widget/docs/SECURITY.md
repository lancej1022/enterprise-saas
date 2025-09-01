# Chat Widget Security Guide

This guide explains how to securely embed and configure the chat widget on your website.

## Overview

The chat widget supports two security levels:

1. **Basic Security**: Domain-based validation and rate limiting
2. **Enhanced Security (JWT)**: Full JWT-based user authentication

## Basic Integration

For basic security with domain validation:

```javascript
// Initialize chat widget with basic security
window.ChatWidget.boot({
  app_id: "your_app_id",
  organizationId: "your_organization_id",
  apiBaseUrl: "https://your-auth-server.com",
  email: "user@example.com",
  name: "User Name",
  user_id: "user_123",
  onSecurityError: (error, code) => {
    console.error("Chat security error:", error, code);
  },
});
```

## Enhanced Security with JWT

For organizations requiring JWT authentication:

### 1. Server-Side JWT Generation

Generate JWTs server-side using your organization's secret:

```javascript
// Node.js example
const jwt = require("jsonwebtoken");

function generateChatJWT(userInfo, organizationSecret) {
  const payload = {
    iss: "https://your-domain.com", // Your domain (required)
    aud: "chat-widget", // Fixed audience (required)
    sub: userInfo.id, // User identifier (required)
    exp: Math.floor(Date.now() / 1000) + 900, // Expires in 15 minutes (required)
    iat: Math.floor(Date.now() / 1000), // Issued at (optional)
    org_id: "your_organization_id", // Your organization ID (required)
    user_data: {
      // Optional user data
      name: userInfo.name,
      email: userInfo.email,
      custom_fields: {
        department: "support",
        tier: "premium",
      },
    },
  };

  return jwt.sign(payload, organizationSecret, { algorithm: "HS256" });
}

// Usage in your web application
app.get("/chat-token", (req, res) => {
  const userInfo = getCurrentUser(req); // Your authentication logic
  const token = generateChatJWT(userInfo, process.env.CHAT_JWT_SECRET);
  res.json({ token });
});
```

### 2. Client-Side Integration with JWT

```javascript
// Fetch JWT from your server
async function initializeChatWidget() {
  try {
    const response = await fetch("/chat-token");
    const { token } = await response.json();

    window.ChatWidget.boot({
      app_id: "your_app_id",
      organizationId: "your_organization_id",
      userJWT: token, // Include JWT for enhanced security
      apiBaseUrl: "https://your-auth-server.com",
      email: "user@example.com",
      name: "User Name",
      user_id: "user_123",
      onSecurityError: (error, code) => {
        if (code === "JWT_INVALID" || code === "JWT_REQUIRED") {
          // Handle JWT-related errors
          console.error("JWT authentication failed:", error);
          // Optionally refresh token and retry
        }
      },
    });
  } catch (error) {
    console.error("Failed to initialize chat widget:", error);
  }
}

// Initialize when page loads
initializeChatWidget();
```

## JWT Requirements

### Required Claims

- `iss` (issuer): Your domain (must match request origin)
- `aud` (audience): Must be "chat-widget"
- `sub` (subject): Unique user identifier in your system
- `exp` (expiration): Token expiration time (recommended: 5-15 minutes)
- `org_id`: Your organization ID

### Optional Claims

- `iat` (issued at): Token creation time
- `user_data`: Object containing user information and custom fields

### Security Best Practices

1. **Generate JWTs server-side only** - Never expose your JWT secret in client code
2. **Use short expiration times** - Recommended 5-15 minutes maximum
3. **Validate issuer** - JWT issuer should match the request domain
4. **Secure secret storage** - Store JWT secrets in environment variables
5. **Monitor for errors** - Implement proper error handling and logging

## Domain Configuration

Configure allowed domains in your organization settings:

```javascript
// Example allowed domains configuration
[
  "yourdomain.com", // Exact domain match
  "*.yourdomain.com", // Wildcard for subdomains
  "app.example.com", // Specific subdomain
];
```

## Error Handling

The widget provides detailed error codes for different security scenarios:

```javascript
function handleSecurityError(error, code) {
  switch (code) {
    case "DOMAIN_NOT_ALLOWED":
      console.error("Domain not whitelisted:", error);
      break;
    case "JWT_REQUIRED":
      console.error("JWT authentication required:", error);
      break;
    case "JWT_INVALID":
      console.error("Invalid JWT token:", error);
      // Refresh token and retry
      break;
    case "RATE_LIMITED":
      console.warn("Rate limit exceeded:", error);
      // Implement backoff strategy
      break;
    case "ORGANIZATION_NOT_FOUND":
      console.error("Invalid organization ID:", error);
      break;
    default:
      console.error("Unknown security error:", error);
  }
}
```

## Rate Limiting

The widget implements automatic rate limiting:

- **Per Organization**: 100 requests per minute
- **Per IP Address**: 20 requests per minute

Rate limit information is included in successful responses for monitoring.

## Testing Your Integration

Use the provided testing endpoints:

```javascript
// Test organization configuration
fetch("/rpc/chat.getConfig", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ organizationId: "your_org_id" }),
});

// Get JWT documentation and examples
fetch("/rpc/chat.getJWTDocs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ organizationId: "your_org_id" }),
});
```

## Migration Guide

### From Legacy to Secure Implementation

1. **Enable domain whitelisting** in your organization settings
2. **Test basic security** with domain validation
3. **Generate JWT secret** for your organization
4. **Implement server-side JWT generation** following the examples above
5. **Update client code** to include JWT parameter
6. **Test JWT authentication** thoroughly
7. **Switch to JWT required mode** when ready

### Backward Compatibility

The widget maintains backward compatibility:

- Existing implementations continue to work with basic security
- JWT authentication is opt-in via organization settings
- No breaking changes to the existing API

## Support

For additional help with chat widget security:

1. Check the error logs in your browser console
2. Verify your JWT payload structure matches requirements
3. Test with the provided debugging endpoints
4. Contact support with specific error codes and messages

## Security Considerations

⚠️ **Important Security Notes**:

- Never log or expose JWT secrets in client-side code
- Implement proper error handling to avoid information leakage
- Use HTTPS for all communications
- Regularly rotate JWT secrets
- Monitor authentication failures and suspicious activity
- Implement proper session management in your application
