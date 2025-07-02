import { NextRequest, NextResponse } from 'next/server'
import { db, orders, dailyRevenue } from '@/lib/db'
import { verifyAdminAuth } from '@/lib/auth'
import { and, gte, lte, ne, sql } from 'drizzle-orm'

// GET /api/reports/daily-revenue - Get daily revenue data (Admin only)
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0]

    // First try to get data from daily_revenue table
    const dailyRevenueData = await db
      .select()
      .from(dailyRevenue)
      .where(
        and(
          gte(dailyRevenue.date, startDate),
          lte(dailyRevenue.date, endDate)
        )
      )

    // If we have pre-aggregated data, use it
    if (dailyRevenueData.length > 0) {
      const revenueData = dailyRevenueData.map(item => ({
        date: item.date,
        amount: parseFloat(item.amount.toString())
      }))

      // Fill in missing dates with 0 revenue
      const start = new Date(startDate)
      const end = new Date(endDate)
      const filledData = []
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const existingData = revenueData.find(item => item.date === dateStr)
        filledData.push({
          date: dateStr,
          amount: existingData ? existingData.amount : 0
        })
      }

      return NextResponse.json({
        data: filledData,
        total_days: filledData.length,
        total_revenue: filledData.reduce((sum, item) => sum + item.amount, 0),
        start_date: startDate,
        end_date: endDate,
        source: 'aggregated'
      })
    }

    // Fallback: calculate from orders table
    const startDateTime = new Date(startDate + 'T00:00:00.000Z')
    const endDateTime = new Date(endDate + 'T23:59:59.999Z')

    const filteredOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateTime),
          lte(orders.createdAt, endDateTime),
          ne(orders.status, 'Cancelled')
        )
      )

    // Group orders by date and calculate daily revenue
    const dailyRevenueMap: { [key: string]: number } = {}
    
    filteredOrders.forEach(order => {
      const date = order.createdAt?.toISOString().split('T')[0] || ''
      const amount = parseFloat(order.totalAmount.toString())
      dailyRevenueMap[date] = (dailyRevenueMap[date] || 0) + amount
    })

    // Convert to array format for charts
    const revenueData = Object.entries(dailyRevenueMap)
      .map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Fill in missing dates with 0 revenue
    const start = new Date(startDate)
    const end = new Date(endDate)
    const filledData = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const existingData = revenueData.find(item => item.date === dateStr)
      filledData.push({
        date: dateStr,
        amount: existingData ? existingData.amount : 0
      })
    }

    return NextResponse.json({
      data: filledData,
      total_days: filledData.length,
      total_revenue: filledData.reduce((sum, item) => sum + item.amount, 0),
      start_date: startDate,
      end_date: endDate,
      source: 'calculated'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily revenue data' },
      { status: 500 }
    )
  }
} 