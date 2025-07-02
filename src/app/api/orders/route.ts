import { NextRequest, NextResponse } from 'next/server'
import { db, orders, dailyRevenue } from '@/lib/db/connection'
import { verifyAdminAuth } from '@/lib/auth'
import { desc, eq, sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

// GET /api/orders - List orders (Admin: all orders, User: their orders only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // If email is provided, it's a user requesting their own orders
    if (email) {
      // Fetch user's orders only - select only existing columns
      const userOrders = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          email: orders.email,
          customerName: orders.customerName,
          address: orders.address,
          pickup: orders.pickup,
          items: orders.items,
          specialInstructions: orders.specialInstructions,
          status: orders.status,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt
        })
        .from(orders)
        .where(eq(orders.email, email))
        .orderBy(desc(orders.createdAt))

      // Transform data to match frontend expectations
      const transformedOrders = userOrders.map(order => ({
        id: order.id,
        user_id: order.userId,
        customer_email: order.email,
        customer_name: order.customerName,
        delivery_address: order.address,
        is_pickup: order.pickup,
        items: order.items,
        special_instructions: order.specialInstructions,
        status: order.status,
        total_amount: order.totalAmount,
        payment_method: 'pay-on-delivery', // Default value since column doesn't exist
        created_at: order.createdAt?.toISOString(),
        updated_at: order.updatedAt?.toISOString()
      }))

      return NextResponse.json(transformedOrders)
    }

    // Otherwise, it's an admin request - verify admin authentication
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all orders from database - select only existing columns
    const allOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        email: orders.email,
        customerName: orders.customerName,
        address: orders.address,
        pickup: orders.pickup,
        items: orders.items,
        specialInstructions: orders.specialInstructions,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))

    // Transform data to match frontend expectations
    const transformedOrders = allOrders.map(order => ({
      id: order.id,
      user_id: order.userId,
      email: order.email,
      customer_name: order.customerName,
      address: order.address,
      pickup: order.pickup,
      items: order.items,
      special_instructions: order.specialInstructions,
      status: order.status,
      total_amount: order.totalAmount,
      payment_method: 'pay-on-delivery', // Default value since column doesn't exist
      created_at: order.createdAt?.toISOString(),
      updated_at: order.updatedAt?.toISOString()
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order (Guest/Member)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      user_id, 
      email, 
      customer_name, 
      address, 
      pickup, 
      items, 
      special_instructions, 
      payment_method 
    } = body

    // Validate required fields
    if (!email || !customer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: email, customer_name, and items' },
        { status: 400 }
      )
    }

    // Validate address if not pickup
    if (!pickup && !address) {
      return NextResponse.json(
        { error: 'Address is required for delivery orders' },
        { status: 400 }
      )
    }

    // Calculate total amount (mock calculation - in production would fetch real prices)
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price || 25.99) * (item.quantity || 1)
    }, 0)

    // Generate custom order ID
    const orderId = `ORD-${Date.now().toString().slice(-8)}-${createId().slice(-4).toUpperCase()}`

    // Create order data - only include columns that exist in database
    const newOrder = {
      id: orderId,
      userId: user_id || null,
      email,
      customerName: customer_name,
      address: pickup ? null : address,
      pickup: pickup || false,
      items,
      specialInstructions: special_instructions || '',
      status: 'Pending' as const,
      totalAmount
      // Note: Not including paymentMethod since it doesn't exist in database
    }

    // Insert order into database
    const [insertedOrder] = await db.insert(orders).values(newOrder).returning()

    // Update daily revenue tracking
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    try {
      await db
        .insert(dailyRevenue)
        .values({
          date: today,
          amount: totalAmount.toString(),
          orderCount: '1'
        })
        .onConflictDoUpdate({
          target: dailyRevenue.date,
          set: {
            amount: sql`${dailyRevenue.amount} + ${totalAmount}`,
            orderCount: sql`${dailyRevenue.orderCount} + 1`,
            updatedAt: new Date()
          }
        })
    } catch (revenueError) {
      console.error('Failed to update daily revenue:', revenueError)
      // Don't fail the order creation if revenue tracking fails
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        id: insertedOrder.id,
        user_id: insertedOrder.userId,
        email: insertedOrder.email,
        customer_name: insertedOrder.customerName,
        address: insertedOrder.address,
        pickup: insertedOrder.pickup,
        items: insertedOrder.items,
        special_instructions: insertedOrder.specialInstructions,
        status: insertedOrder.status,
        total_amount: insertedOrder.totalAmount,
        payment_method: payment_method || 'pay-on-delivery', // Return the requested payment method
        created_at: insertedOrder.createdAt?.toISOString(),
        updated_at: insertedOrder.updatedAt?.toISOString()
      },
      tracking_url: `/track?orderId=${insertedOrder.id}`
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 