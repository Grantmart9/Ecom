CREATE TABLE "inventory_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity_change" integer NOT NULL,
	"movement_type" varchar(50) NOT NULL,
	"reference_id" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_product_id" ON "inventory_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_type" ON "inventory_movements" USING btree ("movement_type");