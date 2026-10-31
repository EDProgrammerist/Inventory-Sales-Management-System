CREATE TABLE "workspace_record" (
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"id" text NOT NULL,
	"data" jsonb NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_record_user_id_kind_id_pk" PRIMARY KEY("user_id","kind","id")
);
--> statement-breakpoint
ALTER TABLE "workspace_record" ADD CONSTRAINT "workspace_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_product_name_unique" ON "workspace_record" USING btree ("user_id",lower("data"->>'name')) WHERE "workspace_record"."kind" = 'products';--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_product_sku_unique" ON "workspace_record" USING btree ("user_id",lower("data"->>'sku')) WHERE "workspace_record"."kind" = 'products';--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_supplier_unique" ON "workspace_record" USING btree ("user_id",lower("data"->>'email'),lower("data"->>'product')) WHERE "workspace_record"."kind" = 'suppliers';--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_store_branch_unique" ON "workspace_record" USING btree ("user_id",lower("data"->>'branch')) WHERE "workspace_record"."kind" = 'stores';