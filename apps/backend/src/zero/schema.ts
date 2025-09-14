import { definePermissions } from "@rocicorp/zero";

import { builder, schema } from "./schema.gen";
import type { Schema } from "./schema.gen";

export { schema, type Schema, builder };

/** @lintignore */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- TODO: this is from Ztunes
export const permissions = definePermissions<{}, Schema>(schema, () => ({}));
