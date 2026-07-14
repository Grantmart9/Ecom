CREATE TYPE "public"."inventory_movement_type" AS ENUM('manual_adjustment', 'order_fulfilled', 'order_cancelled', 'restock', 'return', 'initial_stock', 'reservation');--> statement-breakpoint
ALTER TABLE "inventory_movements" ALTER COLUMN "movement_type" SET DEFAULT 'manual_adjustment'::"public"."inventory_movement_type";--> statement-breakpoint
ALTER TABLE "inventory_movements" ALTER COLUMN "movement_type" SET DATA TYPE "public"."inventory_movement_type" USING "movement_type"::"public"."inventory_movement_type";--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "reference_type" varchar(50);--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_ref_type" ON "inventory_movements" USING btree ("reference_type");--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_user_id" ON "inventory_movements" USING btree ("user_id");