'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, TrendingUp, Edit, Trash2, Save, X, Calendar, DollarSign, BarChart3, Users, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload'
import { LineChart } from '@/components/ui/line-chart'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface FoodItem {
  id: string
  category: string
  name: string
  description: string
  image_url: string
  price: string
  created_at: string
  updated_at: string
}

function MenuManagement() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: 'salt',
    name: '',
    description: '',
    image_url: '',
    price: '25.99'
  })

  const fetchFoods = async () => {
    try {
      const adminPassword = sessionStorage.getItem('adminPassword')
      const response = await fetch('/api/foods', {
        headers: {
          'x-admin-password': adminPassword || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFoods(data)
      }
    } catch (error) {
      console.error('Failed to fetch foods:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFoods()
  }, [])

  const resetForm = () => {
    setFormData({
      category: 'salt',
      name: '',
      description: '',
      image_url: '',
      price: '25.99'
    })
  }

  const handleStartAdd = () => {
    resetForm()
    setShowAddForm(true)
    setEditingId(null)
  }

  const handleStartEdit = (food: FoodItem) => {
    setFormData({
      category: food.category,
      name: food.name,
      description: food.description,
      image_url: food.image_url,
      price: food.price
    })
    setEditingId(food.id)
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const adminPassword = sessionStorage.getItem('adminPassword')
      const url = editingId ? `/api/foods/${editingId}` : '/api/foods'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword || ''
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchFoods()
        handleCancel()
        alert(`Food item ${editingId ? 'updated' : 'added'} successfully!`)
      } else {
        const error = await response.json()
        alert(`Failed to ${editingId ? 'update' : 'add'} food item: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to submit food:', error)
      alert(`Failed to ${editingId ? 'update' : 'add'} food item`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteFood = async (id: string) => {
    if (submitting) return
    if (!confirm('Are you sure you want to delete this food item?')) return

    setSubmitting(true)

    try {
      const adminPassword = sessionStorage.getItem('adminPassword')
      const response = await fetch(`/api/foods/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword || ''
        }
      })

      if (response.ok) {
        await fetchFoods()
        alert('Food item deleted successfully!')
      } else {
        alert('Failed to delete food item')
      }
    } catch (error) {
      console.error('Failed to delete food:', error)
      alert('Failed to delete food item')
    } finally {
      setSubmitting(false)
    }
  }

  const isActionInProgress = showAddForm || editingId !== null || submitting

  if (loading) {
    return <div className="text-center py-8">Loading menu items...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Items ({foods.length})</h2>
        <Button 
          onClick={handleStartAdd}
          disabled={isActionInProgress}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Food
        </Button>
      </div>

      {/* Add/Edit Food Form */}
      {(showAddForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit Food Item' : 'Add New Food Item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salt">Savoury</SelectItem>
                      <SelectItem value="sweet">Sweet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  disabled={submitting}
                />
              </div>
              <div>
                <CloudinaryUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({...formData, image_url: url || ''})}
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? 'Saving...' : (editingId ? 'Update Food' : 'Add Food')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map((food) => (
          <Card key={food.id} className="overflow-hidden flex flex-col h-full">
            <div className="bg-muted relative h-48 w-full flex items-center justify-center p-2">
              <img 
                src={food.image_url} 
                alt={food.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/300/200"
                }}
              />
            </div>
            <div className="flex flex-col flex-1 p-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{food.name}</h3>
                  <Badge variant={food.category === 'salt' ? 'secondary' : 'outline'}>
                    {food.category === 'salt' ? 'savoury' : food.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{food.description}</p>
                <p className="text-lg font-semibold text-green-600">${food.price}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleStartEdit(food)}
                  disabled={isActionInProgress}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteFood(food.id)}
                  disabled={isActionInProgress}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {foods.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No menu items found. Add your first food item!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface OrderItem {
  food_id: string
  name: string
  price: number
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

function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const adminPassword = sessionStorage.getItem('adminPassword')
      const response = await fetch('/api/orders', {
        headers: {
          'x-admin-password': adminPassword || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Prevent multiple simultaneous updates for the same order
    if (updatingOrders.has(orderId)) return
    
    setUpdatingOrders(prev => new Set(prev).add(orderId))
    
    try {
      const adminPassword = sessionStorage.getItem('adminPassword')
      
      // Map frontend status to backend status
      const statusMap: { [key: string]: string } = {
        'pending': 'Pending',
        'confirmed': 'Preparing',
        'preparing': 'Preparing',
        'ready': 'Out for Delivery',
        'delivered': 'Completed',
        'cancelled': 'Cancelled'
      }
      
      const backendStatus = statusMap[newStatus] || newStatus
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword || ''
        },
        body: JSON.stringify({ status: backendStatus })
      })

      if (response.ok) {
        await fetchOrders()
        // Success feedback without alert
        console.log('Order status updated successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to update order status:', errorData)
        alert('Failed to update order status: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>
  }

  const getStatusColor = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase()
    
    switch (normalizedStatus) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': 
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': 
      case 'out for delivery': return 'bg-green-100 text-green-800'
      case 'delivered':
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderOrderItems = (items: OrderItem[]) => {
    if (!Array.isArray(items)) {
      return <span className="text-muted-foreground">No items found</span>
    }

    return (
      <div className="space-y-1">
        {items.map((item, index) => {
          if (typeof item === 'string') {
            // Handle legacy string format
            return <div key={index} className="text-sm">• {item}</div>
          } else if (typeof item === 'object' && item.name) {
            // Handle object format
            return (
              <div key={index} className="text-sm">
                • {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                <span className="text-muted-foreground ml-2">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            )
          } else {
            // Fallback for unknown format
            return <div key={index} className="text-sm text-muted-foreground">• Unknown item</div>
          }
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
        <Button onClick={fetchOrders} variant="outline">
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No orders found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      {order.customer_name} • {order.customer_email}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </div>
                    <p className="text-lg font-semibold mt-1">${order.total_amount}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Delivery Info</h4>
                    {order.is_pickup ? (
                      <p className="text-sm text-muted-foreground">🏪 Pickup Order</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        📍 {order.delivery_address}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      💳 {order.payment_method}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Items</h4>
                    {renderOrderItems(order.items)}
                    {order.special_instructions && (
                      <p className="text-sm text-muted-foreground mt-2">
                        📝 {order.special_instructions}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Update Status</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-40 justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={updatingOrders.has(order.id)}
                        className="w-full justify-between"
                      >
                        {updatingOrders.has(order.id) ? (
                          <>
                            <span>Updating...</span>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          </>
                        ) : (
                          <>
                            <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => {
                        const isCurrentStatus = order.status.toLowerCase() === status.toLowerCase()
                        return (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => {
                              if (!isCurrentStatus && !updatingOrders.has(order.id)) {
                                updateOrderStatus(order.id, status)
                              }
                            }}
                            className={`cursor-pointer ${
                              isCurrentStatus ? 'bg-muted' : ''
                            } ${
                              isCurrentStatus || updatingOrders.has(order.id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                status === 'pending' ? 'bg-yellow-500' :
                                status === 'confirmed' ? 'bg-blue-500' :
                                status === 'preparing' ? 'bg-orange-500' :
                                status === 'ready' ? 'bg-green-500' :
                                status === 'delivered' ? 'bg-gray-500' :
                                'bg-red-500'
                              }`}></div>
                              <span className={isCurrentStatus ? 'font-medium' : ''}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                              {isCurrentStatus && (
                                <span className="text-xs text-muted-foreground ml-auto">Current</span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

interface RevenueData {
  date: string
  amount: number
}

interface LifetimeRevenueData {
  total_revenue: number
  total_orders: number
  average_order_value: number
  revenue_by_status: { [key: string]: number }
  calculated_at: string
}

function ReportsManagement() {
  const [dailyRevenue, setDailyRevenue] = useState<RevenueData[]>([])
  const [lifetimeRevenue, setLifetimeRevenue] = useState<LifetimeRevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      const adminPassword = sessionStorage.getItem('adminPassword')
      
      // Fetch daily revenue data
      const dailyResponse = await fetch(
        `/api/reports/daily-revenue?start=${dateRange.start}&end=${dateRange.end}`,
        {
          headers: {
            'x-admin-password': adminPassword || ''
          }
        }
      )
      
      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json()
        setDailyRevenue(dailyData.data || [])
      }

      // Fetch lifetime revenue data
      const lifetimeResponse = await fetch('/api/reports/lifetime-revenue', {
        headers: {
          'x-admin-password': adminPassword || ''
        }
      })
      
      if (lifetimeResponse.ok) {
        const lifetimeData = await lifetimeResponse.json()
        setLifetimeRevenue(lifetimeData)
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenueData()
  }, [dateRange])

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="text-center py-8">Loading revenue data...</div>
  }

  const totalRevenueInRange = dailyRevenue.reduce((sum, item) => sum + item.amount, 0)
  const averageDailyRevenue = dailyRevenue.length > 0 ? totalRevenueInRange / dailyRevenue.length : 0
  const highestDay = dailyRevenue.reduce((max, item) => item.amount > max.amount ? item : max, { date: '', amount: 0 })

  return (
    <div className="space-y-6">
      {/* Header with Date Range Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Revenue Reports</h2>
        <div className="flex gap-2 items-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <Button onClick={fetchRevenueData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Lifetime Revenue Statistics */}
      {lifetimeRevenue && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lifetime Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${lifetimeRevenue.total_revenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lifetimeRevenue.total_orders}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${lifetimeRevenue.average_order_value.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per order average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${totalRevenueInRange.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dateRange.start} to {dateRange.end}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Revenue Trend
          </CardTitle>
          <CardDescription>
            Revenue performance over the selected date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyRevenue.length > 0 ? (
            <div className="space-y-4">
              <LineChart 
                data={dailyRevenue} 
                width={800} 
                height={300} 
                className="w-full"
              />
              
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">${averageDailyRevenue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Average Daily Revenue</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">${highestDay.amount.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    Highest Day ({new Date(highestDay.date).toLocaleDateString()})
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">{dailyRevenue.length}</div>
                  <div className="text-sm text-muted-foreground">Days in Range</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No revenue data available for the selected date range.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Status Breakdown */}
      {lifetimeRevenue && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Order Status</CardTitle>
            <CardDescription>
              Breakdown of revenue by order completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(lifetimeRevenue.revenue_by_status).map(([status, amount]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'Completed' || status === 'delivered' ? 'bg-green-500' :
                      status === 'Pending' ? 'bg-yellow-500' :
                      status === 'preparing' ? 'bg-blue-500' :
                      status === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="capitalize font-medium">{status}</span>
                  </div>
                  <span className="font-semibold">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Check if user is authenticated
    const adminPassword = sessionStorage.getItem('adminPassword')
    if (adminPassword) {
      // Verify the password is still valid
      fetch('/api/foods', {
        headers: {
          'x-admin-password': adminPassword
        }
      }).then(response => {
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          sessionStorage.removeItem('adminPassword')
          router.push('/admin/login')
        }
        setIsLoading(false)
      }).catch(() => {
        sessionStorage.removeItem('adminPassword')
        router.push('/admin/login')
        setIsLoading(false)
      })
    } else {
      router.push('/admin/login')
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword')
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-primary hover:text-primary/80">
              芽 YUM-YUM
            </Link>
            <span className="text-muted-foreground text-sm">|</span>
            <span className="text-lg font-semibold">Admin Portal</span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-6">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 