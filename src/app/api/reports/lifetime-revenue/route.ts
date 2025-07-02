import { NextRequest, NextResponse } from 'next/server'
import { db, orders } from '@/lib/db'
import { verifyAdminAuth } from '@/lib/auth'
import { ne, sql } from 'drizzle-orm'

// GET /api/reports/lifetime-revenue - Get total lifetime revenue (Admin only)
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all orders excluding cancelled ones
    const completedOrders = await db
      .select()
      .from(orders)
      .where(ne(orders.status, 'Cancelled'))

    // Calculate total revenue
    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString())
    }, 0)
    
    // Additional statistics
    const totalOrders = completedOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Get all orders for status breakdown
    const allOrders = await db.select().from(orders)
    
    // Revenue by status
    const revenueByStatus = allOrders.reduce((acc, order) => {
      const amount = parseFloat(order.totalAmount.toString())
      acc[order.status] = (acc[order.status] || 0) + amount
      return acc
    }, {} as { [key: string]: number })

    return NextResponse.json({
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_orders: totalOrders,
      average_order_value: Math.round(averageOrderValue * 100) / 100,
      revenue_by_status: revenueByStatus,
      calculated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lifetime revenue data' },
      { status: 500 }
    )
  }
} 