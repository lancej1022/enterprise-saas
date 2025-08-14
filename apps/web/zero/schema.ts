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

// Chat types
export type ChatUser = Row<typeof schema.tables.chatUsers>;
export type Conversation = Row<typeof schema.tables.conversations>;
export type Message = Row<typeof schema.tables.messages>;
export type Attachment = Row<typeof schema.tables.attachments>;
export type ConversationAssignment = Row<
  typeof schema.tables.conversationAssignments
>;

// The decoded value of the JWT. Im not 100% sure, but it seems this is the main (only?) way for Zero Cache Server to access logged-in user's information
export interface DecodedJWT {
  // The organization ID. This is pulled from the "activeOrganizationId" field of the JWT token.
  activeOrganizationId: string;
  // The logged-in user. This is pulled from the "sub" field of the JWT token. TODO: is this actually correct?
  sub: string;
}

function allowIfCartOwner(
  authData: DecodedJWT,
  // eslint-disable-next-line @typescript-eslint/unbound-method -- taken from ztunes
  { cmp }: ExpressionBuilder<Schema, "cartItem">,
) {
  // You can see a cart item if you are its owner.
  return cmp("userId", authData.sub);
}
function allowIfInOrganization(
  authData: DecodedJWT,
  eb: ExpressionBuilder<Schema, "members">,
) {
  // You can see the members of an organization if you are a member of that organization
  return eb.cmp("organizationId", authData.activeOrganizationId);
}

// Chat permission functions
function allowIfSameOrganization(
  authData: DecodedJWT,
  eb: ExpressionBuilder<Schema, "chatUsers">,
) {
  // You can see chat users if they belong to your organization
  return eb.cmp("organizationId", authData.activeOrganizationId);
}

function allowIfConversationParticipant(
  authData: DecodedJWT,
  eb: ExpressionBuilder<Schema, "conversations">,
) {
  // You can see conversations if they belong to your organization
  return eb.cmp("organizationId", authData.activeOrganizationId);
}

// TODO: I have no idea whether this is 100% correct
export const permissions = definePermissions<DecodedJWT, Schema>(schema, () => {
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
        select: [allowIfInOrganization],
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
    chatUsers: {
      row: {
        select: [allowIfSameOrganization],
      },
    },
    conversations: {
      row: {
        select: [allowIfConversationParticipant],
      },
    },
    messages: {
      row: {
        // TODO: Implement proper relationship-based permissions
        // For now using ANYONE_CAN to get the system working
        select: ANYONE_CAN,
      },
    },
    attachments: {
      row: {
        // TODO: Implement proper relationship-based permissions
        select: ANYONE_CAN,
      },
    },
    conversationAssignments: {
      row: {
        // TODO: Implement proper relationship-based permissions
        select: ANYONE_CAN,
      },
    },
  } satisfies PermissionsConfig<DecodedJWT, Schema>;
});
