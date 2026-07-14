CREATE TYPE "public"."address_type" AS ENUM('billing', 'shipping', 'both');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('in_stock', 'out_of_stock', 'preorder', 'backorder', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."cart_item_status" AS ENUM('active', 'reserved', 'purchased', 'removed');--> statement-breakpoint
CREATE TYPE "public"."cart_type" AS ENUM('active', 'saved_for_later', 'abandoned', 'converted');--> statement-breakpoint
CREATE TYPE "public"."category_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."discount_scope" AS ENUM('order', 'product', 'category', 'shipping');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount', 'free_shipping');--> statement-breakpoint
CREATE TYPE "public"."order_item_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."token_type" AS ENUM('email_verification', 'password_reset', 'two_factor');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" integer NOT NULL,
	"changes" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"guest_token" varchar(64),
	"type" varchar(20) DEFAULT 'active' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "idx_carts_guest_token" UNIQUE("guest_token")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"parent_id" integer,
	"image" varchar(255),
	"icon" varchar(100),
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "idx_categories_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(255),
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"minimum_purchase" numeric(10, 2) DEFAULT '0' NOT NULL,
	"maximum_usage" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"usage_limit_per_user" integer DEFAULT 1 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"applicable_to" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code"),
	CONSTRAINT "idx_discount_codes_code" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 10,
	"track_inventory" boolean DEFAULT true NOT NULL,
	"allow_backorder" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_product_id_unique" UNIQUE("product_id"),
	CONSTRAINT "idx_inventory_product_id" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"data" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_sku" varchar(100),
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"shipping_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"billing_address_id" integer,
	"shipping_address_id" integer,
	"shipping_method" varchar(50),
	"payment_method" varchar(50),
	"payment_transaction_id" varchar(255),
	"idempotency_key" varchar(255),
	"customer_notes" text,
	"admin_notes" text,
	"confirmed_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "idx_orders_order_number" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"provider" varchar(100),
	"provider_payment_id" varchar(255),
	"last_four" varchar(4),
	"billing_address_id" integer,
	"refunded_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"refunded_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"alt_text" varchar(255),
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"weight" numeric(8, 3),
	"dimensions" varchar(100),
	"sku" varchar(100),
	"barcode" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"availability_status" varchar(50) DEFAULT 'in_stock' NOT NULL,
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	"category_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "idx_products_slug" UNIQUE("slug"),
	CONSTRAINT "idx_products_sku" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"order_id" uuid,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"helpful_votes" integer DEFAULT 0 NOT NULL,
	"reported_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"estimated_days" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(20) DEFAULT 'both' NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"company" varchar(255),
	"address_line1" varchar(255) NOT NULL,
	"address_line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone" varchar(20),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"token" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_four" varchar(4),
	"brand" varchar(50),
	"expiry_month" integer,
	"expiry_year" integer,
	"billing_address_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_token_unique" UNIQUE("token"),
	CONSTRAINT "idx_user_sessions_token" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_type" varchar(50) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	"ip_address" varchar(45),
	"user_agent" text,
	CONSTRAINT "idx_user_tokens_token" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"hashed_password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" varchar(255),
	"email_verification_lookup_key" varchar(16),
	"password_reset_token" varchar(255),
	"password_reset_lookup_key" varchar(16),
	"password_reset_expires" timestamp with time zone,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone_number" varchar(20),
	"avatar_url" varchar(255),
	"last_login" timestamp with time zone,
	"role" varchar(50) DEFAULT 'customer' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_address_id_user_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_user_addresses_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_billing_address_id_user_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_billing_address_id_user_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity_type" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity_id" ON "audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "idx_cart_items_cart_id" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "idx_cart_items_product_id" ON "cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_carts_user_id" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_categories_parent_id" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_categories_status" ON "categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_product_id" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_order_id" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_product_images_product_id" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_products_category_id" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reviews_user_id" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_product_id" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_user_addresses_user_id" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "user_payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_tokens_user_id" ON "user_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_tokens_type" ON "user_tokens" USING btree ("token_type");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");