import { pgTable, uuid, varchar, text, timestamp, boolean, numeric, jsonb } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Users table for member authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(createId()),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(), // User's display name - REQUIRED FIELD
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Foods table for menu items
export const foods = pgTable('foods', {
  id: uuid('id').primaryKey().default(createId()),
  category: varchar('category', { length: 10 }).notNull(), // 'salt' or 'sweet'
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Orders table
export const orders = pgTable('orders', {
  id: varchar('id', { length: 50 }).primaryKey(), // Custom format like 'ORD-123456'
  userId: uuid('user_id').references(() => users.id),
  email: varchar('email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  address: text('address'),
  pickup: boolean('pickup').default(false),
  items: jsonb('items').notNull(), // Array of order items
  specialInstructions: text('special_instructions'),
  status: varchar('status', { length: 50 }).default('Pending').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('pay-on-delivery'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Daily revenue table for analytics
export const dailyRevenue = pgTable('daily_revenue', {
  date: varchar('date', { length: 10 }).primaryKey(), // YYYY-MM-DD format
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  orderCount: numeric('order_count').default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Food = typeof foods.$inferSelect
export type NewFood = typeof foods.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type DailyRevenue = typeof dailyRevenue.$inferSelect
export type NewDailyRevenue = typeof dailyRevenue.$inferInsert 