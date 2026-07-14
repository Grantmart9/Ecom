ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_carrier" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;