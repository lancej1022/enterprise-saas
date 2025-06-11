# Role-Based Access Control (RBAC) Implementation Guide

MAKE SURE TO CHECK OUT <https://www.better-auth.com/docs/plugins/organization#schema> FOR THE BETTER AUTH REFERENCE!!

## Overview

This guide outlines the implementation of a scalable RBAC system for transforming your chat app into an enterprise B2B platform. The design supports multi-tenancy, flexible permissions, and scales well for enterprise use cases.

## Database Schema Design

### Migration 1: Core RBAC Tables

```sql
-- File: backend/sql/migrations/00002_add_rbac.sql
-- +goose Up
-- +goose StatementBegin

-- Organizations/Tenants table for multi-tenancy
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE, -- for built-in roles
    UNIQUE(name, organization_id)
);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    name TEXT NOT NULL UNIQUE, -- e.g., 'chirps:read', 'users:manage'
    description TEXT,
    resource TEXT NOT NULL, -- e.g., 'chirps', 'users', 'organizations'
    action TEXT NOT NULL -- e.g., 'read', 'write', 'delete', 'manage'
);

-- Many-to-many: Users to Organizations
CREATE TABLE members (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(user_id, organization_id)
);

-- Many-to-many: Users to Roles (scoped by organization)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMP, -- optional role expiration
    UNIQUE(user_id, role_id, organization_id)
);

-- Many-to-many: Roles to Permissions
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    UNIQUE(role_id, permission_id)
);

-- Update users table to include organization context
ALTER TABLE users ADD COLUMN default_organization_id UUID REFERENCES organizations(id);

-- Update chirps to be organization-scoped
ALTER TABLE chirps ADD COLUMN organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_org_id ON user_roles(organization_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_chirps_org_id ON chirps(organization_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE role_permissions;
DROP TABLE user_roles;
DROP TABLE user_organizations;
DROP TABLE permissions;
DROP TABLE roles;
DROP TABLE organizations;
ALTER TABLE users DROP COLUMN default_organization_id;
ALTER TABLE chirps DROP COLUMN organization_id;
-- +goose StatementEnd
```

### Migration 2: Seed Data for Roles & Permissions

```sql
-- File: backend/sql/migrations/00003_seed_rbac_data.sql
-- +goose Up
-- +goose StatementBegin

-- Insert common permissions
INSERT INTO permissions (id, created_at, updated_at, name, description, resource, action) VALUES
-- Chirp permissions
(gen_random_uuid(), NOW(), NOW(), 'chirps:read', 'Read chirps', 'chirps', 'read'),
(gen_random_uuid(), NOW(), NOW(), 'chirps:write', 'Create and edit own chirps', 'chirps', 'write'),
(gen_random_uuid(), NOW(), NOW(), 'chirps:delete', 'Delete own chirps', 'chirps', 'delete'),
(gen_random_uuid(), NOW(), NOW(), 'chirps:moderate', 'Moderate all chirps in organization', 'chirps', 'moderate'),

-- User permissions
(gen_random_uuid(), NOW(), NOW(), 'users:read', 'View user profiles', 'users', 'read'),
(gen_random_uuid(), NOW(), NOW(), 'users:invite', 'Invite new users to organization', 'users', 'invite'),
(gen_random_uuid(), NOW(), NOW(), 'users:manage', 'Manage user accounts and roles', 'users', 'manage'),

-- Organization permissions
(gen_random_uuid(), NOW(), NOW(), 'organization:read', 'View organization details', 'organization', 'read'),
(gen_random_uuid(), NOW(), NOW(), 'organization:manage', 'Manage organization settings', 'organization', 'manage'),

-- Analytics permissions
(gen_random_uuid(), NOW(), NOW(), 'analytics:read', 'View organization analytics', 'analytics', 'read');

-- Create system roles that apply to all organizations
INSERT INTO roles (id, created_at, updated_at, name, description, organization_id, is_system_role) VALUES
(gen_random_uuid(), NOW(), NOW(), 'super_admin', 'System administrator with all permissions', NULL, TRUE),
(gen_random_uuid(), NOW(), NOW(), 'org_admin', 'Organization administrator', NULL, TRUE),
(gen_random_uuid(), NOW(), NOW(), 'org_moderator', 'Organization moderator', NULL, TRUE),
(gen_random_uuid(), NOW(), NOW(), 'org_member', 'Regular organization member', NULL, TRUE),
(gen_random_uuid(), NOW(), NOW(), 'org_viewer', 'Read-only organization access', NULL, TRUE);

-- Assign permissions to system roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'super_admin' AND r.is_system_role = TRUE;

-- Org Admin gets most permissions except super admin functions
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'org_admin' AND r.is_system_role = TRUE
AND p.name IN ('chirps:read', 'chirps:write', 'chirps:delete', 'chirps:moderate',
               'users:read', 'users:invite', 'users:manage', 'organization:read',
               'organization:manage', 'analytics:read');

-- Org Moderator gets moderation permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'org_moderator' AND r.is_system_role = TRUE
AND p.name IN ('chirps:read', 'chirps:write', 'chirps:delete', 'chirps:moderate',
               'users:read', 'organization:read', 'analytics:read');

-- Org Member gets basic permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'org_member' AND r.is_system_role = TRUE
AND p.name IN ('chirps:read', 'chirps:write', 'chirps:delete', 'users:read', 'organization:read');

-- Org Viewer gets read-only permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'org_viewer' AND r.is_system_role = TRUE
AND p.name IN ('chirps:read', 'users:read', 'organization:read');

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM role_permissions;
DELETE FROM roles WHERE is_system_role = TRUE;
DELETE FROM permissions;
-- +goose StatementEnd
```

## Key Design Decisions

### 1. Multi-Tenancy Architecture

- **Organizations Table**: Central tenant isolation
- **Organization-Scoped Data**: All user data tied to organizations
- **Cross-Organization Users**: Users can belong to multiple organizations

### 2. Permission System

- **Resource:Action Pattern**: `chirps:read`, `users:manage`, etc.
- **Granular Controls**: Separate permissions for different operations
- **Extensible**: Easy to add new resources and actions

### 3. Role Hierarchy

- **System Roles**: Predefined roles that work across all organizations
- **Custom Roles**: Organizations can create their own roles
- **Role Expiration**: Support for temporary access grants

### 4. Performance Optimizations

- **Strategic Indexes**: On frequently queried foreign keys
- **Efficient Queries**: Optimized for common permission checks
- **Minimal Joins**: Direct relationships for fast lookups

## Default Role Permissions

| Role              | Chirps                        | Users                | Organization | Analytics |
| ----------------- | ----------------------------- | -------------------- | ------------ | --------- |
| **super_admin**   | All                           | All                  | All          | All       |
| **org_admin**     | Read, Write, Delete, Moderate | Read, Invite, Manage | Read, Manage | Read      |
| **org_moderator** | Read, Write, Delete, Moderate | Read                 | Read         | Read      |
| **org_member**    | Read, Write, Delete           | Read                 | Read         | -         |
| **org_viewer**    | Read                          | Read                 | Read         | -         |

## Implementation Examples

### Permission Checking Function

```go
// Check if user has permission in organization
func (db *DB) UserHasPermission(userID, orgID uuid.UUID, permission string) (bool, error) {
    query := `
        SELECT EXISTS(
            SELECT 1 FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = $1
            AND ur.organization_id = $2
            AND p.name = $3
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    `
    var hasPermission bool
    err := db.QueryRow(query, userID, orgID, permission).Scan(&hasPermission)
    return hasPermission, err
}
```

### User Creation with Role Assignment

```go
func (db *DB) CreateUserWithRole(email, hashedPassword string, orgID uuid.UUID, roleName string) error {
    tx, err := db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Create user
    userID := uuid.New()
    _, err = tx.Exec(`
        INSERT INTO users (id, created_at, updated_at, email, hashed_password, default_organization_id)
        VALUES ($1, NOW(), NOW(), $2, $3, $4)
    `, userID, email, hashedPassword, orgID)
    if err != nil {
        return err
    }

    // Add to organization
    _, err = tx.Exec(`
        INSERT INTO user_organizations (id, user_id, organization_id, created_at)
        VALUES ($1, $2, $3, NOW())
    `, uuid.New(), userID, orgID)
    if err != nil {
        return err
    }

    // Assign default role
    _, err = tx.Exec(`
        INSERT INTO user_roles (id, user_id, role_id, organization_id, created_at)
        SELECT $1, $2, r.id, $3, NOW()
        FROM roles r
        WHERE r.name = $4 AND r.is_system_role = TRUE
    `, uuid.New(), userID, orgID, roleName)
    if err != nil {
        return err
    }

    return tx.Commit()
}
```

### Get User Permissions

```go
func (db *DB) GetUserPermissions(userID, orgID uuid.UUID) ([]string, error) {
    query := `
        SELECT DISTINCT p.name
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1
        AND ur.organization_id = $2
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        ORDER BY p.name
    `
    rows, err := db.Query(query, userID, orgID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var permissions []string
    for rows.Next() {
        var permission string
        if err := rows.Scan(&permission); err != nil {
            return nil, err
        }
        permissions = append(permissions, permission)
    }
    return permissions, nil
}
```

## Middleware for Permission Enforcement

```go
func RequirePermission(permission string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Extract user and org from context/JWT
            userID := getUserFromContext(r.Context())
            orgID := getOrgFromContext(r.Context())

            hasPermission, err := db.UserHasPermission(userID, orgID, permission)
            if err != nil {
                http.Error(w, "Internal error", 500)
                return
            }

            if !hasPermission {
                http.Error(w, "Forbidden", 403)
                return
            }

            next.ServeHTTP(w, r)
        })
    }
}

// Usage in routes
mux.Handle("/api/chirps", RequirePermission("chirps:read")(chirpsHandler))
mux.Handle("/api/users/invite", RequirePermission("users:invite")(inviteHandler))
```

## Future Enhancements

### 1. Role Inheritance

```sql
-- Add parent_role_id for role hierarchy
ALTER TABLE roles ADD COLUMN parent_role_id UUID REFERENCES roles(id);
```

### 2. Resource-Specific Permissions

```sql
-- Add resource_id for object-level permissions
ALTER TABLE user_roles ADD COLUMN resource_id UUID;
ALTER TABLE user_roles ADD COLUMN resource_type TEXT;
```

### 3. Audit Logging

```sql
CREATE TABLE permission_audit_log (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    permission_checked TEXT NOT NULL,
    permission_granted BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

### 4. Dynamic Permissions

- API-driven permission creation
- Runtime permission updates
- Custom permission templates

## Migration Strategy

1. **Phase 1**: Implement core RBAC tables
2. **Phase 2**: Migrate existing users to organizations
3. **Phase 3**: Add permission enforcement to API endpoints
4. **Phase 4**: Build admin UI for role management
5. **Phase 5**: Add advanced features (inheritance, audit logs)

## Security Considerations

- **Principle of Least Privilege**: Default to minimal permissions
- **Regular Permission Audits**: Track permission usage and changes
- **Role Expiration**: Implement automatic cleanup of expired roles
- **Cross-Organization Isolation**: Ensure data cannot leak between tenants
- **Permission Caching**: Cache permissions with proper invalidation

This RBAC system provides a solid foundation for enterprise B2B features while maintaining flexibility for future growth and customization.
