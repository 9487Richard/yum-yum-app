'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, CheckCircle, Truck, Package } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  customer_name: string
  email: string
  address?: string
  pickup: boolean
  items: any[]
  special_instructions: string
  status: string
  total_amount: number
  created_at: string
  updated_at: string
}

const statusIcons = {
  'Pending': Clock,
  'Preparing': Package,
  'Out for Delivery': Truck,
  'Completed': CheckCircle,
  'Cancelled': Clock
}

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Preparing': 'bg-blue-100 text-blue-800',
  'Out for Delivery': 'bg-purple-100 text-purple-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async (id: string) => {
    if (!id.trim()) {
      setError('Please enter an order ID')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/orders/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Order not found')
      }
      
      setOrder(data)
    } catch (error: unknown) {
      console.error('Failed to fetch order:', error)
      setError('Failed to fetch order details. Please try again.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrder(orderId)
  }

  // Auto-fetch if orderId is provided in URL
  useEffect(() => {
    const urlOrderId = searchParams.get('orderId')
    if (urlOrderId) {
      setOrderId(urlOrderId)
      fetchOrder(urlOrderId)
    }
  }, [searchParams])

  const StatusIcon = order ? statusIcons[order.status as keyof typeof statusIcons] : Clock

  const getStatusColor = (status: string): string => {
    return statusColors[status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'
  }

  return (
    <>
      {/* Order ID Input Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Order ID</CardTitle>
          <CardDescription>
            Enter your order ID to track the status of your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., ORD-1234567890"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Order Details */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5" />
                  Order Status
                </CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Placed on:</strong> {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                <p><strong>Last updated:</strong> {new Date(order.updated_at).toLocaleDateString()} at {new Date(order.updated_at).toLocaleTimeString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {order.customer_name}</p>
                <p><strong>Email:</strong> {order.email}</p>
                {order.pickup ? (
                  <p><strong>Order Type:</strong> Pickup</p>
                ) : (
                  <p><strong>Delivery Address:</strong> {order.address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity || 1}</p>
                    </div>
                    <p className="font-medium">${(item.price || 25.99).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.special_instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{order.special_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Pending', 'Preparing', order.pickup ? 'Ready for Pickup' : 'Out for Delivery', 'Completed'].map((status, index) => {
                  const isCompleted = ['Pending', 'Preparing', 'Out for Delivery', 'Completed'].indexOf(order.status) >= index
                  const isCurrent = order.status === status || (status === 'Ready for Pickup' && order.status === 'Out for Delivery' && order.pickup)
                  
                  return (
                    <div key={status} className={`flex items-center gap-3 ${isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-600' : 'bg-muted'} ${isCurrent ? 'ring-2 ring-green-600 ring-offset-2' : ''}`} />
                      <span className={isCurrent ? 'font-semibold' : ''}>{status}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  )
}

export default function TrackOrder() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.h1 
              className="text-xl sm:text-2xl font-bold text-primary cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="hover:text-primary/80">芽 YUM-YUM</Link>
            </motion.h1>
            <span className="text-muted-foreground text-sm">|</span>
            <span className="text-lg font-semibold">Track Order</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>
          <Suspense fallback={<div>Loading...</div>}>
            <TrackOrderContent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
} 