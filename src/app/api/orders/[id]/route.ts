import { NextRequest, NextResponse } from 'next/server'
import { db, orders } from '@/lib/db/connection'
import { verifyAdminAuth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, params.id))
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Transform data to match frontend expectations
    const transformedOrder = {
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
    }

    // For guest orders, allow access via order ID
    // For member orders, would need to verify JWT token
    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Check if order exists
    const [existingOrder] = await db.select().from(orders).where(eq(orders.id, params.id))
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Completed', 'Cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Update the order
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (status) updateData.status = status

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, params.id))
      .returning()

    return NextResponse.json({
      id: updatedOrder.id,
      user_id: updatedOrder.userId,
      email: updatedOrder.email,
      customer_name: updatedOrder.customerName,
      address: updatedOrder.address,
      pickup: updatedOrder.pickup,
      items: updatedOrder.items,
      special_instructions: updatedOrder.specialInstructions,
      status: updatedOrder.status,
      total_amount: updatedOrder.totalAmount,
      payment_method: 'pay-on-delivery', // Default value since column doesn't exist
      created_at: updatedOrder.createdAt?.toISOString(),
      updated_at: updatedOrder.updatedAt?.toISOString()
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
} 