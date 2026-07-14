/**
 * Inventory service - centralized inventory operations.
 * Handles stock adjustments, reservations, and movement logging.
 */

import { db } from '@/db/client';
import {
  inventory,
  inventoryMovements,
  orderItems,
  orders,
  products,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export type InventoryAdjustmentInput = {
  productId: number;
  quantityChange: number;
  movementType: 'manual_adjustment' | 'order_fulfilled' | 'order_cancelled' | 'restock' | 'return' | 'initial_stock' | 'reservation';
  referenceType?: string;
  referenceId?: string;
  userId?: number;
  notes?: string;
};

export async function adjustInventory(input: InventoryAdjustmentInput) {
  const { productId, quantityChange, referenceType, referenceId, userId, notes } = input;

  const productCheck = await db.select().from(products).where(eq(products.id, productId));
  if (productCheck.length === 0) {
    throw new Error('Product not found');
  }

  const currentInv = await db.select().from(inventory).where(eq(inventory.productId, productId));
  if (currentInv.length === 0) {
    throw new Error('Inventory record not found for product');
  }

  const currentQty = currentInv[0].quantity;
  const newQuantity = currentQty + quantityChange;
  if (newQuantity < 0) {
    throw new Error(`Insufficient stock. Available: ${currentQty}, requested: ${Math.abs(quantityChange)}`);
  }

  const now = new Date();
  const [updated] = await db
    .update(inventory)
    .set({
      quantity: newQuantity,
      updatedAt: now,
    })
    .where(eq(inventory.productId, productId))
    .returning();

  await db.insert(inventoryMovements).values({
    productId,
    quantityChange,
    movementType: input.movementType as 'manual_adjustment' | 'order_fulfilled' | 'order_cancelled' | 'restock' | 'return' | 'initial_stock' | 'reservation',
    referenceType: referenceType ?? null,
    referenceId: referenceId ?? null,
    userId: userId ?? null,
    notes: notes ?? null,
    createdAt: now,
  });

  return updated;
}

export async function reserveStock(productId: number, quantity: number, userId: number) {
  const inv = await db.select().from(inventory).where(eq(inventory.productId, productId));
  if (inv.length === 0) throw new Error('Inventory record not found');

  const available = inv[0].quantity - inv[0].reservedQuantity;
  if (available < quantity) {
    throw new Error(`Insufficient available stock. Available: ${available}, requested: ${quantity}`);
  }

  const now = new Date();
  const [updated] = await db
    .update(inventory)
    .set({
      reservedQuantity: inv[0].reservedQuantity + quantity,
      updatedAt: now,
    })
    .where(eq(inventory.productId, productId))
    .returning();

  await db.insert(inventoryMovements).values({
    productId,
    quantityChange: -quantity,
    movementType: 'reservation',
    referenceType: 'reservation',
    userId,
    notes: `Reserved ${quantity} units`,
    createdAt: now,
  });

  return updated;
}

export async function releaseReservation(productId: number, quantity: number, userId: number) {
  const inv = await db.select().from(inventory).where(eq(inventory.productId, productId));
  if (inv.length === 0) throw new Error('Inventory record not found');

  const now = new Date();
  const [updated] = await db
    .update(inventory)
    .set({
      reservedQuantity: Math.max(0, inv[0].reservedQuantity - quantity),
      updatedAt: now,
    })
    .where(eq(inventory.productId, productId))
    .returning();

  await db.insert(inventoryMovements).values({
    productId,
    quantityChange: quantity,
    movementType: 'manual_adjustment',
    referenceType: 'reservation_release',
    userId,
    notes: `Released reservation of ${quantity} units`,
    createdAt: now,
  });

  return updated;
}

export async function fulfillOrderItems(orderId: string, userId?: number) {
  const orderItemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  if (orderItemsList.length === 0) return [];

  const results = [];
  for (const item of orderItemsList) {
    const updated = await adjustInventory({
      productId: item.productId,
      quantityChange: -item.quantity,
      movementType: 'order_fulfilled',
      referenceType: 'order',
      referenceId: orderId,
      userId,
      notes: `Order ${orderId} fulfillment: -${item.quantity}`,
    });
    results.push({ orderItem: item, inventory: updated });
  }

  const now = new Date();
  await db.update(orders).set({ confirmedAt: now }).where(eq(orders.id, orderId));

  return results;
}

export async function cancelOrderInventory(orderId: string, userId?: number) {
  const orderItemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  if (orderItemsList.length === 0) return [];

  const results = [];
  for (const item of orderItemsList) {
    const updated = await adjustInventory({
      productId: item.productId,
      quantityChange: item.quantity,
      movementType: 'order_cancelled',
      referenceType: 'order',
      referenceId: orderId,
      userId,
      notes: `Order ${orderId} cancellation: +${item.quantity}`,
    });
    results.push({ orderItem: item, inventory: updated });
  }

  return results;
}

export async function getInventoryMovements(productId?: number, limit = 50) {
  const base = db.select({
    id: inventoryMovements.id,
    productId: inventoryMovements.productId,
    quantityChange: inventoryMovements.quantityChange,
    movementType: inventoryMovements.movementType,
    referenceType: inventoryMovements.referenceType,
    referenceId: inventoryMovements.referenceId,
    userId: inventoryMovements.userId,
    notes: inventoryMovements.notes,
    createdAt: inventoryMovements.createdAt,
    productName: products.name,
    productSku: products.sku,
  })
    .from(inventoryMovements)
    .leftJoin(products, eq(inventoryMovements.productId, products.id))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(limit);

  const query = productId ? base.where(eq(inventoryMovements.productId, productId)) : base;
  return query;
}

export async function getInventoryWithProducts() {
  return db.select({
    id: inventory.id,
    productId: inventory.productId,
    quantity: inventory.quantity,
    reservedQuantity: inventory.reservedQuantity,
    lowStockThreshold: inventory.lowStockThreshold,
    trackInventory: inventory.trackInventory,
    allowBackorder: inventory.allowBackorder,
    updatedAt: inventory.updatedAt,
    productName: products.name,
    productSku: products.sku,
    productStatus: products.status,
  })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .orderBy(inventory.id);
}

export type OrderStatusInput = {
  orderId: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  userId?: number;
};

export async function transitionOrderStatus({ orderId, status, userId }: OrderStatusInput) {
  if (status === 'delivered') {
    await fulfillOrderItems(orderId, userId);
  } else if (status === 'cancelled') {
    await cancelOrderInventory(orderId, userId);
  }
}
