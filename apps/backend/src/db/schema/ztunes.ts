import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import * as authSchema from "./auth";

export const artist = pgTable(
  "artist",
  {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    sortName: varchar("sort_name").notNull(),
    type: varchar(),
    beginDate: varchar("begin_date"),
    endDate: varchar("end_date"),
    popularity: integer(),
  },
  (table) => [
    index("artist_name_idx").on(table.name),
    index("artist_popularity_idx").on(table.popularity),
  ],
);

export const album = pgTable(
  "album",
  {
    id: varchar().primaryKey(),
    artistId: varchar("artist_id")
      .notNull()
      .references(() => artist.id),
    title: varchar().notNull(),
    year: integer(),
  },
  (table) => [index("album_artist_id_idx").on(table.artistId)],
);

export const cartItem = pgTable(
  "cart_item",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => authSchema.users.id),
    albumId: varchar("album_id")
      .notNull()
      .references(() => album.id),
    addedAt: timestamp("added_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.albumId] }),
    index("cart_item_user_id_idx").on(table.userId),
    index("cart_item_album_id_idx").on(table.albumId),
  ],
);

export const userRelations = relations(authSchema.users, ({ many }) => ({
  cartItems: many(cartItem),
}));

export const artistRelations = relations(artist, ({ many }) => ({
  albums: many(album),
}));

export const albumRelations = relations(album, ({ one, many }) => ({
  artist: one(artist, {
    fields: [album.artistId],
    references: [artist.id],
  }),
  cartItems: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  album: one(album, {
    fields: [cartItem.albumId],
    references: [album.id],
  }),
  user: one(authSchema.users, {
    fields: [cartItem.userId],
    references: [authSchema.users.id],
  }),
}));
