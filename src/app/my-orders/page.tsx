'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, MapPin, Clock, CreditCard } from 'lucide-react'

interface OrderItem {
  name: string
  price: number
  food_id: string
  quantity: number
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  delivery_address: string
  is_pickup: boolean
  items: OrderItem[]
  special_instructions: string
  payment_method: string
  status: string
  total_amount: number
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          await fetchUserOrders(data.user.email)
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth')
      }
    }

    checkAuth()
  }, [router])

  const fetchUserOrders = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        setError('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderOrderItems = (items: OrderItem[]) => {
    if (!Array.isArray(items)) {
      return <div className="py-1">• No items found</div>
    }

    return items.map((item, i) => {
      if (typeof item === 'string') {
        // Handle legacy string format
        return <div key={i} className="py-1">• {item}</div>
      } else if (typeof item === 'object' && item.name) {
        // Handle object format
        return (
          <div key={i} className="py-1">
            • {item.name} {item.quantity > 1 && `(x${item.quantity})`}
          </div>
        )
      } else {
        // Fallback for unknown format
        return <div key={i} className="py-1">• Unknown item</div>
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

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
              onClick={() => router.push('/')}
            >
              芽 YUM-YUM
            </motion.h1>
            <span className="text-muted-foreground text-sm">|</span>
            <span className="text-lg font-semibold">My Orders</span>
          </div>
          {user && (
            <div className="text-sm text-muted-foreground">
              Welcome, {user.name}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">
              You haven&apos;t placed any orders yet. Ready to try our delicious food?
            </p>
            <Button onClick={() => router.push('/')}>
              Browse Menu
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Order History</h2>
              <p className="text-sm text-muted-foreground">
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(order.created_at)}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} border-0`}>
                            {order.status.toUpperCase()}
                          </Badge>
                          <p className="text-lg font-semibold mt-1">
                            ${order.total_amount}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Items Ordered
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {renderOrderItems(order.items)}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Delivery Details
                          </h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {order.is_pickup ? (
                              <p>🏪 Pickup Order</p>
                            ) : (
                              <p>📍 {order.delivery_address}</p>
                            )}
                            <p className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {order.payment_method}
                            </p>
                          </div>
                        </div>
                      </div>

                      {order.special_instructions && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Special Instructions</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.special_instructions}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 