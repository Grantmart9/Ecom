/**
 * Database seeding script for the ecommerce platform.
 * Populates the database with initial categories and products.
 */
import { db } from '@/db/client'
import { categories, products, productImages, inventory } from '@/db/schema'
import { eq } from 'drizzle-orm'

const seed = async () => {
  console.log('Seeding database...')

  // Create initial product categories
  await db.transaction(async (tx) => {
    const initialCategories = [
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets and electronic devices' },
      { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories and more' },
      { name: 'Home & Living', slug: 'home-living', description: 'Home decor and lifestyle products' },
    ]
    
    for (const cat of initialCategories) {
      await tx.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true,
        status: 'active',
      }).onConflictDoNothing()
    }
  })

  // Build lookup map for category IDs
  const catRows = await db.select().from(categories)
  const categoryMap = Object.fromEntries(catRows.map(c => [c.name, c.id]))

  // Define products to seed
  const productData = [
    { name: 'Wireless Earbuds Pro', slug: 'wireless-earbuds-pro', description: 'High-quality wireless earbuds with active noise cancellation', price: '129.99', categoryId: categoryMap['Electronics'], images: ['https://placehold.co/400x300?text=Wireless+Earbuds'] },
    { name: 'Minimalist Watch', slug: 'minimalist-watch', description: 'Sleek minimalist watch with genuine leather strap', price: '89.99', categoryId: categoryMap['Accessories'], images: ['https://placehold.co/400x300?text=Minimalist+Watch'] },
    { name: 'Leather Wallet', slug: 'leather-wallet', description: 'Premium vegan leather wallet with multiple card slots', price: '49.99', categoryId: categoryMap['Accessories'], images: ['https://placehold.co/400x300?text=Leather+Wallet'] },
    { name: 'Smart Home Speaker', slug: 'smart-home-speaker', description: 'Voice-controlled smart speaker with premium sound', price: '79.99', categoryId: categoryMap['Electronics'], images: ['https://placehold.co/400x300?text=Smart+Speaker'] },
    { name: 'Ceramic Coffee Mug', slug: 'ceramic-coffee-mug', description: 'Handcrafted ceramic mug for your morning coffee', price: '24.99', categoryId: categoryMap['Home & Living'], images: ['https://placehold.co/400x300?text=Coffee+Mug'] },
    { name: 'Travel Backpack', slug: 'travel-backpack', description: 'Durable waterproof backpack with USB charging port', price: '69.99', categoryId: categoryMap['Accessories'], images: ['https://placehold.co/400x300?text=Travel+Backpack'] },
  ]

  // Seed products and related data
  let createdCount = 0
  for (const p of productData) {
    // Skip if product already exists
    const existing = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1)
    if (existing.length === 0) {
      // Create product
      const [prod] = await db.insert(products).values({
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        isActive: true,
        isFeatured: true,
        status: 'active',
        availabilityStatus: 'in_stock',
      }).returning({ id: products.id })

      // Create primary product image
      await db.insert(productImages).values({
        productId: prod.id,
        imageUrl: p.images[0],
        isPrimary: true,
      })

      // Create inventory record
      await db.insert(inventory).values({
        productId: prod.id,
        quantity: 100,
        trackInventory: true,
      })
      createdCount++
    }
  }

  console.log(`Seeded products (created ${createdCount} new)`)
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})