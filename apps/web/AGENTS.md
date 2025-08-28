# AGENTS.md - Web Application

TanStack Start-based web SPA with admin dashboard + chat interface.

## Architecture Patterns

### Route Structure

- File-based routing with TanStack Router
- Authenticated routes under `/_authenticated/`
  - Admin routes under `/_authenticated/admin/`
- Components that are only used within a given route group are placed in `/-components/` directories within that route group. Eg components only used by admin go in `/app/routes/_authenticated/admin/-components/`
- Components which are reused across many route views go in `/app/components/`

### State Management

- **Zero**: Real-time data synchronization with server
- **TanStack Query**: Server state for traditional API calls that are not synced through Zero
- **Tanstack ROuter**: State manager for things like path params and search params.

In general, should be very rare that we use `useState` or `useContext`

### Component Organization

```
app/routes/_authenticated/admin/
├── users.tsx                    # Main route component
├── -components/                 # Route-specific components
│   ├── users-table.tsx
│   ├── users-search-input.tsx
│   └── ...
```

## UI Component Guidelines

### Use @solved-contact/web-ui Package to consume ShadCN components

Always consume [ShadCN](https://ui.shadcn.com/docs/components) components from the shared `web-ui` package

```typescript
// ✅ Correct
import { Button } from "@solved-contact/web-ui/components/button";
import { Card, CardContent } from "@solved-contact/web-ui/components/card";

// ❌ Incorrect - don't create duplicate components
import { Button } from "./button";
```

### Styling Guidelines

- Use Tailwind CSS classes via the web-ui package
- Prefer utility classes over custom CSS
- Always use responsive design patterns, optimizing for a mobile-first responsive approach

## Testing Guidelines

### Playwright E2E Testing

- Tests located in `playwright/` directory
- ALWAYS Use accessibility selectors as the primary strategy as opposed to arbitrary selectors like `page.locator("#element_id_here")`
- Prefer fewer, larger tests rather than many small tests.

#### Accessibility-First Selectors

Always use accessible selectors in tests:

```typescript
// ✅ Preferred - Accessibility selectors
await page.getByRole("button", { name: "Add User" });
await page.getByLabel("Email address");
await page.getByText("Users Management");
await page.getByPlaceholder("Search users...");

// ✅ Acceptable - Test IDs for complex cases
await page.getByTestId("user-actions-menu");

// ❌ Avoid - CSS selectors are brittle
await page.locator(".btn-primary");
await page.locator("#user-form");
```

### Test Organization

```typescript
// Group related tests
test.describe("User Management", () => {
  test("should display user list", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  });

  test("should filter users by team", async ({ page }) => {
    await page.goto("/admin/users");
    await page.getByRole("button", { name: "All Teams" }).click();
    await page.getByRole("menuitem", { name: "Sales" }).click();
    // Verify filtered results
  });
});
```

## Real-time Data Patterns

### Zero Integration

Use [Zero](https://zero.rocicorp.dev/docs/reading-data) for querying and mutating synchronized data:

```typescript
import { useQuery } from "@rocicorp/zero/react";
import { useRouter } from "@tanstack/react-router";

export function UsersList() {
  const router = useRouter();
  const { zero } = router.options.context;

  // Real-time user data
  const users = useQuery(zero.query.users
    .where("organizationId", currentOrgId)
    .orderBy("createdAt", "desc")
  );

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## Security Patterns

### Authentication Guards

- Routes are protected by `_authenticated` layout
- Route context provides authentication state
- Role-based access control in components

```typescript
import { useAuth } from "../hooks/use-auth";

export function AdminOnlyFeature() {
  const { zero, session } = useRouter().options.context;

  if (!session.user?.roles.includes('admin')) {
    return <div>Access denied</div>;
  }

  return <AdminContent />;
}
```

## Performance Guidelines

- Do not use `useCallback` or `useMemo` because this project uses the React Compiler, which means that memoization is automatically handled.

## Development Workflow

### Adding New Features

1. Create route file in appropriate directory
2. Add route-specific components to a `/-components/` directory that is a sibling to the newly created route file
3. Consume UI components from `@solved-contact/web-ui`
4. Add Playwright tests with accessibility selectors

### Admin Dashboard Patterns

- Use consistent card layouts
- Implement proper data tables with sorting/filtering
- Add bulk actions where appropriate
- Include proper loading and error states
- Support keyboard navigation

### Form Handling

Always use `@tanstack/react-form` for building forms. Do not rely on useContect or useState.

```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";

const form = useForm({
  defaultValues: { name: "", email: "" },
  onSubmit: async ({ value }) => {
    await zero.mutate.users.create(value);
  },
  validatorAdapter: zodValidator(),
});
```

## Error Handling

### Error Boundaries

- Implement at route level
- Provide meaningful error messages
- Include recovery actions where possible

### Notifications

```typescript
import { toast } from "sonner";

// Success notifications
toast.success("User created successfully");

// Error handling
toast.error("Failed to update user", {
  description: "Please try again or contact support",
  action: {
    label: "Retry",
    onClick: () => retryAction(),
  },
});
```

## Accessibility Requirements

### ARIA Labels

- Add proper labels to form controls
- Use descriptive button text
- Implement proper heading hierarchy
- Add loading/busy states

### Keyboard Navigation

- Ensure all interactive elements are focusable

### Color and Contrast

- Ensure sufficient color contrast ratios
- Don't rely solely on color for information

## Testing Checklist

- [ ] All interactive elements have accessible names
- [ ] Error states are properly handled
- [ ] Loading states are shown appropriately

Remember: This is an enterprise application focused on accessibility, security, and user experience. Always consider these aspects when building new features.
