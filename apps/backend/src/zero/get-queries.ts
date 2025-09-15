import type { ReadonlyJSONValue } from "@rocicorp/zero";
import {
  syncedQuery,
  syncedQueryWithContext,
  withValidation,
} from "@rocicorp/zero";
import { z } from "zod/v4";

import { builder } from "./schema";

type ClientContext =
  | {
      activeOrganizationId: string;
      userID: string;
    }
  | undefined;

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
  (context: ClientContext) =>
    builder.cartItem
      .related("album", (album) =>
        album.one().related("artist", (artist) => artist.one()),
      )
      .where("userId", context?.userID ?? ""),
);

export const getUsersQuery = syncedQueryWithContext(
  "getUsers",
  z.tuple([z.string().nullable()]),
  (context: ClientContext, search) =>
    builder.users
      .whereExists("members", (q) =>
        q.where("organizationId", context?.activeOrganizationId ?? ""),
      )
      .where("name", "ILIKE", search ? `%${search}%` : "%")
      .related("members")
      .orderBy("updatedAt", "desc")
      .limit(20),
);

export const getIndividualUserQuery = syncedQueryWithContext(
  "getIndividualUser",
  z.tuple([z.string()]),
  (context: ClientContext, userId) =>
    builder.users
      .where("id", userId)
      .whereExists("members", (q) =>
        q.where("organizationId", context?.activeOrganizationId ?? ""),
      )
      .related("members")
      .one(),
);

export const getConversationsQuery = syncedQueryWithContext(
  "getConversations",
  z.tuple([]),
  (context: ClientContext) =>
    builder.conversations
      .where("organizationId", context?.activeOrganizationId ?? "")
      .limit(10)
      .orderBy("updatedAt", "desc")
      .related("chatUser", (chatUser) => chatUser.one()),
);

export const getConversationQuery = syncedQueryWithContext(
  "getConversation",
  z.tuple([z.string()]),
  (_context: ClientContext, conversationId) =>
    builder.conversations.where("id", conversationId),
);

export const getMessagesQuery = syncedQueryWithContext(
  "getMessages",
  z.tuple([z.string()]),
  (_context: ClientContext, conversationId) =>
    builder.messages
      .where("conversationId", conversationId)
      .orderBy("createdAt", "asc"),
);

export const getCartItemsSimpleQuery = syncedQuery(
  "getCartItemsSimple",
  z.tuple([z.string()]),
  (userID) =>
    builder.cartItem.where("userId", userID).orderBy("addedAt", "asc"),
);

// TODO: is this what Im supposed to use client side, rather than invoking the query directly?
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
  context: ClientContext,
  name: string,
  args: readonly ReadonlyJSONValue[],
) {
  const q = queries[name];
  if (!q) {
    throw new Error("Unknown query: " + name);
  }
  if (!context?.userID) {
    throw new Error("User ID is required");
  }
  return { query: q(context, ...args) };
}
