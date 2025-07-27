import {
  ANYONE_CAN,
  definePermissions,
  type ExpressionBuilder,
  type PermissionsConfig,
  type Row,
} from "@rocicorp/zero";

import { schema, type Schema } from "./schema.gen";

export { schema, type Schema };

export type Artist = Row<typeof schema.tables.artist>;
export type Album = Row<typeof schema.tables.album>;

export interface AuthData {
  // The logged-in user.
  sub: string;
}

function allowIfCartOwner(
  authData: AuthData,
  // eslint-disable-next-line @typescript-eslint/unbound-method -- taken from ztunes
  { cmp }: ExpressionBuilder<Schema, "cartItem">,
) {
  // You can see a cart item if you are its owner.
  return cmp("userId", authData.sub);
}

// @ts-expect-error -- taken from ztunes
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- taken from ztunes
export const permissions = definePermissions<{}, Schema>(schema, () => {
  return {
    album: {
      row: {
        select: ANYONE_CAN,
      },
    },
    artist: {
      row: {
        select: ANYONE_CAN,
      },
    },
    cartItem: {
      row: {
        select: [allowIfCartOwner],
      },
    },
    members: {
      row: {
        select: ANYONE_CAN,
      },
    },
    organizations: {
      row: {
        select: ANYONE_CAN,
      },
    },
    users: {
      row: {
        select: ANYONE_CAN,
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});
