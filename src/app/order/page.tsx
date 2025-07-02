'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Minus, ShoppingCart, User, Mail, MapPin, Phone, Facebook, Clock, Star, CreditCard, Truck, Store, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

interface Food {
  id: string
  category: string
  name: string
  description: string
  image_url: string
  price: string
  created_at: string
  updated_at: string
}

interface CartItem {
  food_id: string
  name: string
  price: number
  quantity: number
}

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function OrderPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Form state for non-logged-in users
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [address, setAddress] = useState('')
  const [isPickup, setIsPickup] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('pay-on-delivery')
  
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchFoods()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const fetchFoods = async () => {
    try {
      const response = await fetch('/api/foods')
      if (response.ok) {
        const data = await response.json()
        setFoods(data)
      } else {
        setError('Failed to load menu items')
      }
    } catch (error) {
      console.error('Failed to fetch foods:', error)
      setError('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (food: Food) => {
    const existingItem = cart.find(item => item.food_id === food.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.food_id === food.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        food_id: food.id,
        name: food.name,
        price: parseFloat(food.price),
        quantity: 1
      }])
    }
  }

  const updateQuantity = (food_id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.food_id !== food_id))
    } else {
      setCart(cart.map(item => 
        item.food_id === food_id 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getItemQuantity = (food_id: string) => {
    const item = cart.find(item => item.food_id === food_id)
    return item ? item.quantity : 0
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      setError('Please add items to your cart')
      return
    }

    if (!user && (!customerName || !customerEmail)) {
      setError('Please provide your name and email')
      return
    }

    if (!isPickup && !address) {
      setError('Please provide delivery address or select pickup')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const orderData = {
        user_id: user?.id || null,
        email: user?.email || customerEmail,
        customer_name: user?.name || customerName,
        address: isPickup ? null : address,
        pickup: isPickup,
        items: cart,
        special_instructions: specialInstructions,
        payment_method: paymentMethod
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Send email notification
        try {
          await fetch('/api/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: orderData.email,
              orderId: result.order.id,
              customerName: orderData.customer_name,
              items: cart,
              totalAmount: getTotalAmount(),
              isPickup: isPickup,
              address: address
            })
          })
        } catch (emailError) {
          console.error('Failed to send email:', emailError)
          // Don't fail the order if email fails
        }

        // Redirect to track page with order ID
        router.push(`/track?orderId=${result.order.id}`)
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Failed to submit order:', error)
      setError('Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    )
  }

  const saltFoods = foods.filter(food => food.category === 'salt')
  const sweetFoods = foods.filter(food => food.category === 'sweet')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <motion.h1 
              className="text-2xl font-bold text-primary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Place Order
            </motion.h1>
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <Badge variant="secondary">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </Badge>
              <span className="font-semibold">${getTotalAmount().toFixed(2)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Salt Foods */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Salt Dishes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {saltFoods.map((food) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <img 
                          src={food.image_url} 
                          alt={food.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/api/placeholder/300/200"
                          }}
                        />
                        <CardTitle className="text-lg">{food.name}</CardTitle>
                        <CardDescription>{food.description}</CardDescription>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-2xl font-bold text-primary">${food.price}</span>
                          {getItemQuantity(food.id) === 0 ? (
                            <Button onClick={() => addToCart(food)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(food.id, getItemQuantity(food.id) - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold min-w-[2rem] text-center">
                                {getItemQuantity(food.id)}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(food.id, getItemQuantity(food.id) + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Sweet Foods */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Sweet Treats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sweetFoods.map((food) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <img 
                          src={food.image_url} 
                          alt={food.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/api/placeholder/300/200"
                          }}
                        />
                        <CardTitle className="text-lg">{food.name}</CardTitle>
                        <CardDescription>{food.description}</CardDescription>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-2xl font-bold text-primary">${food.price}</span>
                          {getItemQuantity(food.id) === 0 ? (
                            <Button onClick={() => addToCart(food)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(food.id, getItemQuantity(food.id) - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold min-w-[2rem] text-center">
                                {getItemQuantity(food.id)}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(food.id, getItemQuantity(food.id) + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Your cart is empty. Add some delicious items!
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                      {/* Cart Items */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.food_id} className="flex justify-between items-center py-2 border-b">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total:</span>
                          <span>${getTotalAmount().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Customer Information */}
                      {!user && (
                        <div className="space-y-4 pt-4 border-t">
                          <h3 className="font-semibold">Customer Information</h3>
                          <div>
                            <Label htmlFor="customerName">Full Name</Label>
                            <Input
                              id="customerName"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              required
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerEmail">Email</Label>
                            <Input
                              id="customerEmail"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              required
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                      )}

                      {/* Delivery Information */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Delivery Information</h3>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pickup"
                            checked={isPickup}
                            onCheckedChange={(checked) => setIsPickup(checked as boolean)}
                          />
                          <Label htmlFor="pickup">Pickup Order</Label>
                        </div>
                        {!isPickup && (
                          <div>
                            <Label htmlFor="address">Delivery Address</Label>
                            <Textarea
                              id="address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              required={!isPickup}
                              placeholder="Enter your delivery address"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>

                      {/* Special Instructions */}
                      <div>
                        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                        <Textarea
                          id="instructions"
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="Any special requests or dietary requirements"
                          rows={2}
                        />
                      </div>

                      {/* Payment Method */}
                      <div>
                        <Label htmlFor="payment">Payment Method</Label>
                        <select
                          id="payment"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full p-2 border border-input rounded-md"
                        >
                          <option value="pay-on-delivery">Pay on Delivery</option>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                        </select>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitting || cart.length === 0}
                      >
                        {submitting ? 'Placing Order...' : `Place Order - $${getTotalAmount().toFixed(2)}`}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 