import type { ReadonlyJSONValue } from "@rocicorp/zero";
import {
  syncedQuery,
  syncedQueryWithContext,
  withValidation,
} from "@rocicorp/zero";
import { z } from "zod/v4";

import { builder } from "./schema";

export const getHomepageArtists = syncedQuery(
  "getHomepageArtists",
  z.tuple([z.string()]),
  (q: string) =>
    builder.artist
      .where("name", "ILIKE", `%${q}%`)
      .orderBy("popularity", "desc")
      .limit(20),
);

export const getArtistQuery = syncedQuery(
  "getArtist",
  z.tuple([z.string()]),
  (artistID: string) =>
    builder.artist
      .where("id", artistID)
      .related("albums", (album) => album.related("cartItems"))
      .one(),
);
export const getCartItemsQuery = syncedQueryWithContext(
  "getCartItems",
  z.tuple([]),
  (userID: string | undefined) =>
    builder.cartItem
      .related("album", (album) =>
        album.one().related("artist", (artist) => artist.one()),
      )
      .where("userId", userID ?? ""),
);

export const getUsersQuery = syncedQuery(
  "getUsers",
  z.tuple([z.string(), z.string().nullable()]),
  (organizationId: string, search: null | string) =>
    builder.users
      .whereExists("members", (q) => q.where("organizationId", organizationId))
      .where("name", "ILIKE", search ? `%${search}%` : "%")
      .related("members")
      .orderBy("updatedAt", "desc")
      .limit(20),
);

export const getIndividualUserQuery = syncedQuery(
  "getIndividualUser",
  z.tuple([z.string(), z.string()]),
  (organizationId: string, userId: string) =>
    builder.users
      .where("id", userId)
      .whereExists("members", (q) => q.where("organizationId", organizationId))
      .related("members")
      .one(),
);

export const getConversationsQuery = syncedQuery(
  "getConversations",
  z.tuple([z.string()]),
  (orgId: string) =>
    builder.conversations
      .where("organizationId", orgId)
      .limit(10)
      .orderBy("updatedAt", "desc")
      .related("chatUser", (chatUser) => chatUser.one()),
);

export const getConversationQuery = syncedQuery(
  "getConversation",
  z.tuple([z.string()]),
  (conversationId: string) => builder.conversations.where("id", conversationId),
);

export const getMessagesQuery = syncedQuery(
  "getMessages",
  z.tuple([z.string()]),
  (conversationId: string) =>
    builder.messages
      .where("conversationId", conversationId)
      .orderBy("createdAt", "asc"),
);

export const getCartItemsSimpleQuery = syncedQuery(
  "getCartItemsSimple",
  z.tuple([z.string()]),
  (userID: string | undefined) =>
    builder.cartItem.where("userId", userID ?? "").orderBy("addedAt", "asc"),
);

export const queries = Object.fromEntries(
  [
    getHomepageArtists,
    getCartItemsQuery,
    getArtistQuery,
    getUsersQuery,
    getIndividualUserQuery,
    getConversationsQuery,
    getConversationQuery,
    getMessagesQuery,
    getCartItemsSimpleQuery,
  ].map((q) => [q.queryName, withValidation(q)]),
);

export function getQuery(
  userID: string | undefined,
  name: string,
  args: readonly ReadonlyJSONValue[],
) {
  const q = queries[name];
  if (!q) {
    throw new Error("Unknown query: " + name);
  }
  if (!userID) {
    throw new Error("User ID is required");
  }
  return { query: q(userID, ...args) };
}
