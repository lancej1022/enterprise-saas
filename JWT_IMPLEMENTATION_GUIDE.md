# Chat Widget JWT Implementation Guide

## Overview

This guide explains how to implement JWT authentication for secure chat widget embedding. JWT authentication prevents unauthorized access and user impersonation by requiring server-side token generation with your organization's secret key.

## JWT Payload Structure

Your JWT must include these standard and custom claims:

```typescript
interface ChatWidgetJWTPayload {
  // Standard JWT claims
  iss: string; // Issuer - Your domain (e.g., "app.yourcompany.com")
  aud: string; // Audience - Must be "chat-widget"
  sub: string; // Subject - Your user's unique identifier
  exp: number; // Expiration - Unix timestamp (recommended: 5-15 minutes)
  iat?: number; // Issued At - Unix timestamp (optional but recommended)
  nbf?: number; // Not Before - Unix timestamp (optional)
  jti?: string; // JWT ID - Unique nonce to prevent replay attacks (recommended)

  // Custom claims
  org_id: string; // Your organization ID from our system
  user_data?: {
    // Optional user information for personalization
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: unknown;
  };
}
```

## Implementation Examples

### Node.js (using jsonwebtoken)

```javascript
const jwt = require("jsonwebtoken");

function generateChatJWT(
  userId,
  userEmail,
  userName,
  organizationId,
  jwtSecret,
) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: "yourdomain.com", // Your domain
    aud: "chat-widget", // Required audience
    sub: userId, // Your user's ID
    exp: now + 15 * 60, // 15 minutes from now
    iat: now, // Issued now
    jti: generateUniqueId(), // Unique ID for replay prevention
    org_id: organizationId,
    user_data: {
      name: userName,
      email: userEmail,
    },
  };

  return jwt.sign(payload, jwtSecret, { algorithm: "HS256" });
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
```

### Python (using PyJWT)

```python
import jwt
import time
import random
import string

def generate_chat_jwt(user_id, user_email, user_name, organization_id, jwt_secret):
    now = int(time.time())

    payload = {
        'iss': 'yourdomain.com',  # Your domain
        'aud': 'chat-widget',     # Required audience
        'sub': user_id,           # Your user's ID
        'exp': now + (15 * 60),   # 15 minutes from now
        'iat': now,               # Issued now
        'jti': generate_unique_id(),  # Unique ID for replay prevention
        'org_id': organization_id,
        'user_data': {
            'name': user_name,
            'email': user_email
        }
    }

    return jwt.encode(payload, jwt_secret, algorithm='HS256')

def generate_unique_id():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))
```

### PHP (using firebase/php-jwt)

```php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function generateChatJWT($userId, $userEmail, $userName, $organizationId, $jwtSecret) {
    $now = time();

    $payload = [
        'iss' => 'yourdomain.com',  // Your domain
        'aud' => 'chat-widget',     // Required audience
        'sub' => $userId,           // Your user's ID
        'exp' => $now + (15 * 60),  // 15 minutes from now
        'iat' => $now,              // Issued now
        'jti' => uniqid('', true),  // Unique ID for replay prevention
        'org_id' => $organizationId,
        'user_data' => [
            'name' => $userName,
            'email' => $userEmail
        ]
    ];

    return JWT::encode($payload, $jwtSecret, 'HS256');
}
```

## Frontend Integration

Once you have generated the JWT server-side, pass it to the chat widget:

```html
<script>
  // Initialize chat widget with JWT authentication
  const chatWidget = new ChatWidget({
    organizationId: "your-org-id",
    userJWT: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...", // Generated server-side
    apiBaseUrl: "https://your-api-domain.com",
  });
</script>
```

## Security Requirements

### 1. Server-Side Generation Only

- **NEVER** generate JWTs in client-side JavaScript
- **NEVER** expose your JWT secret to the frontend
- Always generate tokens on your backend server

### 2. Short Expiration Times

- Recommended: 5-15 minutes maximum
- Tokens longer than 15 minutes will be rejected
- Generate new tokens as needed for long sessions

### 3. Proper Claims Validation

- `iss` (issuer): Must match the domain making the request
- `aud` (audience): Must be exactly "chat-widget"
- `sub` (subject): Required - your user's unique identifier
- `exp` (expiration): Required - Unix timestamp
- `org_id`: Must match your organization ID

### 4. Replay Attack Prevention

- Include `jti` (JWT ID) with a unique value
- Each JWT should have a unique `jti` to prevent reuse
- Used `jti` values are tracked to prevent replay attacks

### 5. Domain Validation

- The `iss` claim should match the domain where the widget is embedded
- Requests from mismatched domains will be rejected

## Error Handling

Common JWT validation errors and their meanings:

| Error                                      | Cause                                | Solution                             |
| ------------------------------------------ | ------------------------------------ | ------------------------------------ |
| "Missing user identifier (sub)"            | `sub` claim is missing               | Include user ID in `sub` claim       |
| "Invalid or missing audience (aud)"        | `aud` is not "chat-widget"           | Set `aud` to "chat-widget"           |
| "Token expired"                            | `exp` is in the past                 | Generate a new token                 |
| "Token expiration time too far in future"  | `exp` is more than 15 minutes away   | Reduce expiration time               |
| "JWT issuer does not match request domain" | `iss` doesn't match embedding domain | Ensure `iss` matches the domain      |
| "Token has already been used"              | `jti` has been used before           | Generate new token with unique `jti` |

## Testing Your Implementation

1. **Generate a Test JWT**: Use our API endpoint to create a sample JWT:

   ```bash
   curl -X POST /api/chat/create-sample-jwt \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "organizationId": "your-org-id",
       "userIdentifier": "test-user-123",
       "domain": "yourdomain.com",
       "userData": {
         "name": "Test User",
         "email": "test@example.com"
       }
     }'
   ```

2. **Validate JWT Structure**: Decode your JWT at [jwt.io](https://jwt.io) to verify the payload structure

3. **Test Widget Integration**: Try initializing the widget with your JWT and check browser developer tools for any errors

## Best Practices

1. **Generate JWTs On-Demand**: Create tokens when users navigate to pages with the chat widget
2. **Use Secure Secrets**: Generate strong, random JWT secrets (32+ characters)
3. **Rotate Secrets Periodically**: Update JWT secrets regularly and coordinate with token generation
4. **Monitor for Errors**: Log JWT validation failures to detect potential security issues
5. **Handle Expiration Gracefully**: Implement token refresh logic for long chat sessions

## Troubleshooting

### Widget Won't Initialize

- Check browser console for error messages
- Verify organization ID is correct
- Ensure JWT is generated server-side
- Confirm domain matches `iss` claim

### "JWT Required" Error

- Your organization is set to require JWT authentication
- Generate and pass a valid JWT token
- Contact support if you need to change security level

### "Domain Not Allowed" Error

- The embedding domain isn't in your allowed domains list
- Add the domain through your admin panel
- Ensure domain matches exactly (no www vs www differences)

## Support

For additional help with JWT implementation:

- Check our API documentation
- Review error messages in browser console
- Contact our support team with specific error messages

Remember: Security is paramount. Always generate JWTs server-side and never expose your JWT secret to client-side code.
