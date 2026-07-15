/**
 * Database schema definitions using Drizzle ORM.
 * Contains all tables for the ecommerce platform: users, products, orders, etc.
 */
import { pgTable, serial, varchar, text, boolean, integer, numeric, timestamp, uuid, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';

// User roles and status enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['pending', 'active', 'suspended', 'deleted']);
export const tokenTypeEnum = pgEnum('token_type', ['email_verification', 'password_reset', 'two_factor']);
export const addressTypeEnum = pgEnum('address_type', ['billing', 'shipping', 'both']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded']);
export const paymentMethodTypeEnum = pgEnum('payment_method_type', ['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);
export const orderItemStatusEnum = pgEnum('order_item_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);
export const cartTypeEnum = pgEnum('cart_type', ['active', 'saved_for_later', 'abandoned', 'converted']);
export const cartItemStatusEnum = pgEnum('cart_item_status', ['active', 'reserved', 'purchased', 'removed']);
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected', 'hidden']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount', 'free_shipping']);
export const discountScopeEnum = pgEnum('discount_scope', ['order', 'product', 'category', 'shipping']);
export const categoryStatusEnum = pgEnum('category_status', ['active', 'inactive', 'archived']);
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'inactive', 'archived']);
export const availabilityStatusEnum = pgEnum('availability_status', ['in_stock', 'out_of_stock', 'preorder', 'backorder', 'discontinued']);
export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', ['manual_adjustment', 'order_fulfilled', 'order_cancelled', 'restock', 'return', 'initial_stock', 'reservation']);

// Users table: authentication and profile data
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  emailVerificationLookupKey: varchar('email_verification_lookup_key', { length: 16 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetLookupKey: varchar('password_reset_lookup_key', { length: 16 }),
  passwordResetExpires: timestamp('password_reset_expires', { withTimezone: true }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  role: varchar('role', { length: 50 }).default('customer').notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  usernameIdx: index('idx_users_username').on(table.username),
  roleIdx: index('idx_users_role').on(table.role),
  statusIdx: index('idx_users_status').on(table.status),
}));

export const userAddresses = pgTable('user_addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).default('both').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  company: varchar('company', { length: 255 }),
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_addresses_user_id').on(table.userId),
}));

export const userTokens = pgTable('user_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenType: varchar('token_type', { length: 50 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
}, (table) => ({
  userIdIdx: index('idx_user_tokens_user_id').on(table.userId),
  tokenTypeIdx: index('idx_user_tokens_type').on(table.tokenType),
  tokenIdx: unique('idx_user_tokens_token').on(table.token),
}));

export const userPaymentMethods = pgTable('user_payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastFour: varchar('last_four', { length: 4 }),
  brand: varchar('brand', { length: 50 }),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  billingAddressId: integer('billing_address_id').references(() => userAddresses.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_payment_methods_user_id').on(table.userId),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  parentId: integer('parent_id'),
  image: varchar('image', { length: 255 }),
  icon: varchar('icon', { length: 100 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  status: categoryStatusEnum('status').default('active').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  parentIdIdx: index('idx_categories_parent_id').on(table.parentId),
  slugIdx: index('idx_categories_slug').on(table.slug),
  statusIdx: index('idx_categories_status').on(table.status),
}));

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
  weight: numeric('weight', { precision: 8, scale: 3 }),
  dimensions: varchar('dimensions', { length: 100 }),
  sku: varchar('sku', { length: 100 }).unique(),
  barcode: varchar('barcode', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  availabilityStatus: varchar('availability_status', { length: 50 }).default('in_stock').notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'restrict' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
}, (table) => ({
  categoryIdIdx: index('idx_products_category_id').on(table.categoryId),
  slugIdx: unique('idx_products_slug').on(table.slug),
  skuIdx: unique('idx_products_sku').on(table.sku),
  statusIdx: index('idx_products_status').on(table.status),
}));

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  isPrimary: boolean('is_primary').default(false).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index('idx_product_images_product_id').on(table.productId),
}));

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull().unique(),
  quantity: integer('quantity').default(0).notNull(),
  reservedQuantity: integer('reserved_quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  trackInventory: boolean('track_inventory').default(true).notNull(),
  allowBackorder: boolean('allow_backorder').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  productIdIdx: unique('idx_inventory_product_id').on(table.productId),
}));

export const inventoryMovements = pgTable('inventory_movements', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantityChange: integer('quantity_change').notNull(),
  movementType: inventoryMovementTypeEnum('movement_type').notNull().default('manual_adjustment'),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: varchar('reference_id', { length: 100 }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index('idx_inventory_movements_product_id').on(table.productId),
  movementTypeIdx: index('idx_inventory_movements_type').on(table.movementType),
  referenceTypeIdx: index('idx_inventory_movements_ref_type').on(table.referenceType),
  userIdIdx: index('idx_inventory_movements_user_id').on(table.userId),
}));

export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  guestToken: varchar('guest_token', { length: 64 }),
  type: varchar('type', { length: 20 }).default('active').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => ({
  userIdIdx: index('idx_carts_user_id').on(table.userId),
  guestTokenIdx: unique('idx_carts_guest_token').on(table.guestToken),
}));

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cartIdIdx: index('idx_cart_items_cart_id').on(table.cartId),
  productIdIdx: index('idx_cart_items_product_id').on(table.productId),
}));

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  shippingAmount: numeric('shipping_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('ZAR').notNull(),
  billingAddressId: integer('billing_address_id').references(() => userAddresses.id, { onDelete: 'set null' }),
  shippingAddressId: integer('shipping_address_id').references(() => userAddresses.id, { onDelete: 'set null' }),
  shippingMethod: varchar('shipping_method', { length: 50 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentTransactionId: varchar('payment_transaction_id', { length: 255 }),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
  customerNotes: text('customer_notes'),
  adminNotes: text('admin_notes'),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  shippingCarrier: varchar('shipping_carrier', { length: 100 }),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_orders_user_id').on(table.userId),
  statusIdx: index('idx_orders_status').on(table.status),
  orderNumberIdx: unique('idx_orders_order_number').on(table.orderNumber),
}));

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productSku: varchar('product_sku', { length: 100 }),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
}, (table) => ({
  orderIdIdx: index('idx_order_items_order_id').on(table.orderId),
  productIdIdx: index('idx_order_items_product_id').on(table.productId),
}));

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('ZAR').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 100 }),
  providerPaymentId: varchar('provider_payment_id', { length: 255 }),
  lastFour: varchar('last_four', { length: 4 }),
  billingAddressId: integer('billing_address_id').references(() => userAddresses.id, { onDelete: 'set null' }),
  refundedAmount: numeric('refunded_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  refundedAt: timestamp('refunded_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index('idx_payments_order_id').on(table.orderId),
  statusIdx: index('idx_payments_status').on(table.status),
}));

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }),
  comment: text('comment'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  helpfulVotes: integer('helpful_votes').default(0).notNull(),
  reportedCount: integer('reported_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_reviews_user_id').on(table.userId),
  productIdIdx: index('idx_reviews_product_id').on(table.productId),
}));

export const discountCodes = pgTable('discount_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minimumPurchase: numeric('minimum_purchase', { precision: 10, scale: 2 }).default('0').notNull(),
  maximumUsage: integer('maximum_usage'),
  usageCount: integer('usage_count').default(0).notNull(),
  usageLimitPerUser: integer('usage_limit_per_user').default(1).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  applicableTo: text('applicable_to'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  codeIdx: unique('idx_discount_codes_code').on(table.code),
}));

export const shippingMethods = pgTable('shipping_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  estimatedDays: varchar('estimated_days', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: integer('entity_id').notNull(),
  changes: text('changes'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_audit_logs_user_id').on(table.userId),
  actionIdx: index('idx_audit_logs_action').on(table.action),
  entityTypeIdx: index('idx_audit_logs_entity_type').on(table.entityType),
  entityIdIdx: index('idx_audit_logs_entity_id').on(table.entityId),
}));

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  refreshToken: varchar('refresh_token', { length: 255 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_sessions_user_id').on(table.userId),
  tokenIdx: unique('idx_user_sessions_token').on(table.token),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_notifications_user_id').on(table.userId),
  typeIdx: index('idx_notifications_type').on(table.type),
}));

export const storeSettings = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  storeName: varchar('store_name', { length: 255 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  shippingZones: text('shipping_zones').notNull().default('[]'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, 'insert'>;
export type UserAddress = InferModel<typeof userAddresses>;
export type NewUserAddress = InferModel<typeof userAddresses, 'insert'>;
export type UserToken = InferModel<typeof userTokens>;
export type NewUserToken = InferModel<typeof userTokens, 'insert'>;
export type UserPaymentMethod = InferModel<typeof userPaymentMethods>;
export type NewUserPaymentMethod = InferModel<typeof userPaymentMethods, 'insert'>;
export type Category = InferModel<typeof categories>;
export type NewCategory = InferModel<typeof categories, 'insert'>;
export type Product = InferModel<typeof products>;
export type NewProduct = InferModel<typeof products, 'insert'>;
export type ProductImage = InferModel<typeof productImages>;
export type NewProductImage = InferModel<typeof productImages, 'insert'>;
export type Inventory = InferModel<typeof inventory>;
export type NewInventory = InferModel<typeof inventory, 'insert'>;
export type InventoryMovement = InferModel<typeof inventoryMovements>;
export type NewInventoryMovement = InferModel<typeof inventoryMovements, 'insert'>;
export type Cart = InferModel<typeof carts>;
export type NewCart = InferModel<typeof carts, 'insert'>;
export type CartItem = InferModel<typeof cartItems>;
export type NewCartItem = InferModel<typeof cartItems, 'insert'>;
export type Order = InferModel<typeof orders>;
export type NewOrder = InferModel<typeof orders, 'insert'>;
export type OrderItem = InferModel<typeof orderItems>;
export type NewOrderItem = InferModel<typeof orderItems, 'insert'>;
export type Payment = InferModel<typeof payments>;
export type NewPayment = InferModel<typeof payments, 'insert'>;
export type Review = InferModel<typeof reviews>;
export type NewReview = InferModel<typeof reviews, 'insert'>;
export type DiscountCode = InferModel<typeof discountCodes>;
export type NewDiscountCode = InferModel<typeof discountCodes, 'insert'>;
export type ShippingMethod = InferModel<typeof shippingMethods>;
export type NewShippingMethod = InferModel<typeof shippingMethods, 'insert'>;
export type AuditLog = InferModel<typeof auditLogs>;
export type NewAuditLog = InferModel<typeof auditLogs, 'insert'>;
export type UserSession = InferModel<typeof userSessions>;
export type NewUserSession = InferModel<typeof userSessions, 'insert'>;
export type Notification = InferModel<typeof notifications>;
export type NewNotification = InferModel<typeof notifications, 'insert'>;

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(userAddresses),
  paymentMethods: many(userPaymentMethods),
  orders: many(orders),
  reviews: many(reviews),
  sessions: many(userSessions),
  notifications: many(notifications),
}));

export const userAddressesRelations = relations(userAddresses, ({ one, many }) => ({
  user: one(users, {
    fields: [userAddresses.userId],
    references: [users.id],
  }),
  paymentMethods: many(userPaymentMethods),
  billingOrders: many(orders, {
    relationName: 'billingAddress',
  }),
  shippingOrders: many(orders, {
    relationName: 'shippingAddress',
  }),
}));

export const userPaymentMethodsRelations = relations(userPaymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [userPaymentMethods.userId],
    references: [users.id],
  }),
  billingAddress: one(userAddresses, {
    fields: [userPaymentMethods.billingAddressId],
    references: [userAddresses.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  inventory: one(inventory),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
  reviews: many(reviews),
  billingAddress: one(userAddresses, {
    fields: [orders.billingAddressId],
    references: [userAddresses.id],
    relationName: 'billingAddress',
  }),
  shippingAddress: one(userAddresses, {
    fields: [orders.shippingAddressId],
    references: [userAddresses.id],
    relationName: 'shippingAddress',
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  billingAddress: one(userAddresses, {
    fields: [payments.billingAddressId],
    references: [userAddresses.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export const shippingMethodsRelations = relations(shippingMethods, ({ many }) => ({
  orders: many(orders),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
