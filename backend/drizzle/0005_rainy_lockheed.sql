CREATE TYPE "public"."CustomerOrderStatus" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."OrderPaymentState" AS ENUM('demo_paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "customer_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"request_hash" text NOT NULL,
	"items" jsonb NOT NULL,
	"address" jsonb NOT NULL,
	"shipping" jsonb NOT NULL,
	"subtotal" numeric(16, 2) NOT NULL,
	"status" "CustomerOrderStatus" DEFAULT 'pending' NOT NULL,
	"payment_state" "OrderPaymentState" DEFAULT 'demo_paid' NOT NULL,
	"stock_reserved" boolean DEFAULT true NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_order_subtotal_positive" CHECK ("customer_order"."subtotal">0)
);
--> statement-breakpoint
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_order_idempotency_unique" ON "customer_order" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "customer_order_user_idx" ON "customer_order" USING btree ("user_id");