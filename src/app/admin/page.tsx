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
import { ArrowLeft, Plus, TrendingUp, Edit, Trash2, Save, X } from 'lucide-react'
import Link from 'next/link'
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload'

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
                      <SelectItem value="salt">Salt</SelectItem>
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
          <Card key={food.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative overflow-hidden">
              <img 
                src={food.image_url} 
                alt={food.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/300/200"
                }}
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {food.name}
                    <Badge variant={food.category === 'salt' ? 'secondary' : 'outline'}>
                      {food.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">{food.description}</CardDescription>
                  <p className="text-lg font-semibold text-green-600 mt-2">${food.price}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
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
            </CardContent>
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

interface Order {
  id: string
  customer_name: string
  customer_email: string
  delivery_address: string
  is_pickup: boolean
  items: string[]
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const adminPassword = sessionStorage.getItem('adminPassword')
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword || ''
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchOrders()
        alert('Order status updated successfully!')
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order status')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
                    <p className="text-sm text-muted-foreground">
                      {order.items.join(', ')}
                    </p>
                    {order.special_instructions && (
                      <p className="text-sm text-muted-foreground mt-1">
                        📝 {order.special_instructions}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Update Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={order.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, status)}
                        disabled={order.status === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced reporting features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 