CREATE TABLE "album" (
	"id" varchar PRIMARY KEY NOT NULL,
	"artist_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"year" integer
);
--> statement-breakpoint
CREATE TABLE "artist" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"sort_name" varchar NOT NULL,
	"type" varchar,
	"begin_date" varchar,
	"end_date" varchar,
	"popularity" integer
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"user_id" varchar NOT NULL,
	"album_id" varchar NOT NULL,
	"added_at" timestamp NOT NULL,
	CONSTRAINT "cart_item_user_id_album_id_pk" PRIMARY KEY("user_id","album_id")
);
--> statement-breakpoint
DROP TABLE "jwks" CASCADE;--> statement-breakpoint
ALTER TABLE "album" ADD CONSTRAINT "album_artist_id_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_album_id_album_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."album"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "album_artist_id_idx" ON "album" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "artist_name_idx" ON "artist" USING btree ("name");--> statement-breakpoint
CREATE INDEX "artist_popularity_idx" ON "artist" USING btree ("popularity");--> statement-breakpoint
CREATE INDEX "cart_item_user_id_idx" ON "cart_item" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cart_item_album_id_idx" ON "cart_item" USING btree ("album_id");