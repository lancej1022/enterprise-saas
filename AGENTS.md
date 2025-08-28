# AGENTS.md

Turborepo Monorepo housing the entire stack for a customer support chat-widget application.

## Setup Commands

- Install dependencies: `pnpm install`
- Run linting: `pnpm turbo lint`
- Format code: `pnpm format:fix`
- Type checking: `pnpm turbo typecheck`

## Project Architecture

### Apps

- `apps/web` - TanStack Start web application with admin dashboard and chat dashboard
- `apps/mobile` - React Native Expo app containg the mobile app with similar functionality to `apps/web`
- `apps/auth-server` - Authentication and API server with Drizzle ORM, Postgres, Hono, oRPC, and Better Auth
- `apps/test-playground` - Development testing environment

### Packages

- `packages/web-ui` - Shared Radix UI components with shadcn/ui
- `packages/chat-widget` - Embeddable chat widget for external websites
- `tooling/*` - Shared configuration for ESLint, TypeScript, etc.
- `backend/` - Go backend service (legacy, not used at this point in time)

## Code Style Guidelines

### TypeScript

- Strict mode enabled across all packages
- Prefer `const` assertions and `as const` for type safety

### Imports

- Always prefer named exports over default exports where possible

### Naming Conventions

- Files: kebab-case (`user-profile.tsx`)
- Components: PascalCase (`UserProfile`)
- Functions/variables: camelCase (`getUserData`)
- Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- Always prefer `function` declaration over `const` functions

## Monorepo Development Tips

### Workspace Dependencies

- Reference workspace packages with `@solved-contact/` namespace
- Follow a single-version policy by putting any dependencies used in multiple workspaces into the `pnpm-workspace.yaml` file and installing with the `catalog:` protocol

### Build System

- Turbo manages build caching and dependencies
- Each package has standardized scripts: `dev`, `build`, `lint`, `typecheck`
