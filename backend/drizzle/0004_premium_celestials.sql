ALTER TABLE "catalog_product" ADD COLUMN "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog_product" ADD COLUMN "stock_quantity" integer;--> statement-breakpoint
ALTER TABLE "catalog_product" ADD COLUMN "threshold" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog_product" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "catalog_product" ADD CONSTRAINT "catalog_stock_nonnegative" CHECK ("catalog_product"."stock_quantity" IS NULL OR "catalog_product"."stock_quantity" >= 0);--> statement-breakpoint
ALTER TABLE "catalog_product" ADD CONSTRAINT "catalog_threshold_nonnegative" CHECK ("catalog_product"."threshold" >= 0);