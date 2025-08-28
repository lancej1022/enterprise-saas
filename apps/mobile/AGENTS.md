# AGENTS.md - Mobile Application

React Native Expo application with authentication

## Architecture Overview

### Expo Router + React Navigation

- File-based routing with typed routes
- Stack navigation with protected routes
- Tab navigation for main app sections
- Authentication guards with session-based protection

### State Management

- **Expo Router**: contains state like path params and search params
- **Zero**: majority of server state that is managed via the Zero sync engine
- **TanStack Query**: Server state for non synced state
- **Better Auth Expo**: Authentication state

## Mobile-Specific Guidelines

### React Native Components

Use [React Native Reusables](https://reactnativereusables.com/) and import from `#/components/ui/component_goes_here`

```typescript
import { Appearance, Platform, StatusBar } from "react-native";

import { Button } from "#/components/ui/button";
import { Card } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
```

## Theme and Styling

### NativeWind + Tailwind CSS

- Use NativeWind for React Native Tailwind support

## Component Development

### UI Component Guidelines

- Follow accessibility guidelines with proper labels
- Implement proper touch handling

### Form Handling

Use @tanstack/react-form for all forms. Never rely on `useState` or `useContext` for building forms

```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";

const LoginForm = () => {
  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(value);
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <Container>
      <form.Field name="email">
        {(field) => (
          <Input
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      </form.Field>
    </Container>
  );
};
```

## Authentication Patterns

### Better Auth Integration

```typescript
// Auth client setup
import { authClient } from "#/lib/auth-client";

// Session management
const { data: session, isPending } = authClient.useSession();

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// Sign out
await authClient.signOut();
```

### Testing Strategy

- Use Maestro for E2E testing (when configured)
- Test on both iOS and Android simulators

### Screen Reader Support

- Use semantic markup
- Provide meaningful labels
- Group related elements

### Keyboard Navigation

- Support external keyboard navigation
- Implement proper focus management
- Add keyboard shortcuts where appropriate
