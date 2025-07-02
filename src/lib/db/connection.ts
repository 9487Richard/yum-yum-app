import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'
import { pgTable, uuid, varchar, text, timestamp, boolean, numeric, jsonb } from 'drizzle-orm/pg-core'

// Define schema to match the ACTUAL database structure
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const foods = pgTable('foods', {
  id: uuid('id').primaryKey(),
  category: varchar('category', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // Note: No image_public_id, price, or is_available columns - they don't exist
})

export const orders = pgTable('orders', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: uuid('user_id'),
  email: varchar('email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  address: text('address'),
  pickup: boolean('pickup').default(false),
  items: jsonb('items').notNull(),
  specialInstructions: text('special_instructions'),
  status: varchar('status', { length: 50 }).default('Pending').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  // Note: No payment_method column - it doesn't exist in the actual database
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dailyRevenue = pgTable('daily_revenue', {
  date: varchar('date', { length: 10 }).primaryKey(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  orderCount: numeric('order_count').default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Create connection pool
const pool = new neon({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true
})

// Create drizzle instance with schema
export const db = drizzle(pool, { 
  schema: { users, foods, orders, dailyRevenue } 
})

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Food = typeof foods.$inferSelect
export type NewFood = typeof foods.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type DailyRevenue = typeof dailyRevenue.$inferSelect
export type NewDailyRevenue = typeof dailyRevenue.$inferInsert 