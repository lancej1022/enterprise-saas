import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
} from "better-auth/plugins/organization/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
  ...defaultStatements,
  // TODO: define realistic permissions here -- https://www.better-auth.com/docs/plugins/organization#custom-permissions
  project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
  project: ["create"],
});

export const admin = ac.newRole({
  project: ["create", "update"],
  ...adminAc.statements,
});

export const owner = ac.newRole({
  ...admin.statements,
  project: ["create", "update", "delete"],
});

export const myCustomRole = ac.newRole({
  project: ["create", "update", "delete"],
  organization: ["update"],
});
