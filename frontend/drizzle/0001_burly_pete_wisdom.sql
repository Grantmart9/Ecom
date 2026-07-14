ALTER TABLE "categories" DROP CONSTRAINT "categories_name_unique";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_slug_unique";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "idx_categories_slug";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."category_status";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "status" SET DATA TYPE "public"."category_status" USING "status"::"public"."category_status";--> statement-breakpoint
CREATE INDEX "idx_categories_slug" ON "categories" USING btree ("slug");