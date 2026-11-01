CREATE TYPE "public"."CatalogCategory" AS ENUM('phones', 'computers', 'consoles');--> statement-breakpoint
CREATE TABLE "catalog_product" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"variant" text NOT NULL,
	"category" "CatalogCategory" NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"image_key" text NOT NULL,
	"description" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_price_positive" CHECK ("catalog_product"."price" > 0)
);
--> statement-breakpoint
ALTER TABLE "catalog_product" ADD CONSTRAINT "catalog_product_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;