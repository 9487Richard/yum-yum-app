'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDropdown } from '@/hooks/use-dropdown'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Facebook, ShoppingCart, Clock, User, LogOut, Package } from 'lucide-react'

interface FoodItem {
  id: string
  category: string
  name: string
  description: string
  image_url: string
}

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [menuItems, setMenuItems] = useState<{ salt: FoodItem[]; sweet: FoodItem[] }>({
    salt: [],
    sweet: []
  })
  const { isOpen, toggle, dropdownRef } = useDropdown()

  // Fetch menu items and check user authentication on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/foods')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Ensure we have an array of foods
        const foods: FoodItem[] = Array.isArray(data) ? data : []
        
        const saltFoods = foods.filter(food => food.category === 'salt')
        const sweetFoods = foods.filter(food => food.category === 'sweet')
        
        setMenuItems({ salt: saltFoods, sweet: sweetFoods })
      } catch (error) {
        console.error('Failed to fetch menu items:', error)
        // Set empty arrays on error to prevent filter issues
        setMenuItems({ salt: [], sweet: [] })
      }
    }

    const checkUserAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to check user authentication:', error)
      }
    }
    
    fetchMenuItems()
    checkUserAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (response.ok) {
        setUser(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1 
            className="text-xl sm:text-2xl font-bold text-primary cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => window.location.href = '/'}
          >
            芽 YUM-YUM
          </motion.h1>
          <nav className="flex gap-2 sm:gap-4 items-center flex-wrap">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => window.location.href = '/order'}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Order Now
            </Button>
            {user ? (
              <DropdownMenu ref={dropdownRef}>
                <DropdownMenuTrigger onClick={toggle} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Hi, {user.name}</span>
                  <span className="sm:hidden">Hi, {user.name.split(' ')[0]}</span>
                </DropdownMenuTrigger>
                {isOpen && (
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.location.href = '/my-orders'}>
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/auth'}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Login / Sign Up</span>
                  <span className="sm:hidden">Login</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground text-xs sm:text-sm"
                  onClick={() => window.location.href = '/admin/login'}
                >
                  Admin
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="text-center">
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-green-600 mb-2">
                  芽 YUMYUM 芽
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground">
                  Fresh • Organic • Delicious
                </p>
              </div>
            </div>
            
            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Button 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                onClick={() => window.location.href = '/order'}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Order Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                asChild
              >
                <a href="https://www.facebook.com/people/YUM-YUM-%E8%8A%BD%E8%8A%BD/61575848334127/" target="_blank" rel="noopener noreferrer">
                  <Facebook className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Contact Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu Display */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.h3 
            className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Our Menu
          </motion.h3>

          <Tabs defaultValue="salt" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
              <TabsTrigger value="salt" className="text-sm sm:text-base">Savoury Food</TabsTrigger>
              <TabsTrigger value="sweet" className="text-sm sm:text-base">Sweet Food</TabsTrigger>
            </TabsList>

            <TabsContent value="salt">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {menuItems.salt.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-muted relative h-48 w-full flex items-center justify-center p-2">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/300/200"
                          }}
                        />
                      </div>
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                          <span className="truncate mr-2">{item.name}</span>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">Savoury</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sweet">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {menuItems.sweet.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-muted relative h-48 w-full flex items-center justify-center p-2">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/300/200"
                          }}
                        />
                      </div>
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                          <span className="truncate mr-2">{item.name}</span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">Sweet</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-4">芽 YUM-YUM</h4>
              <p className="text-muted-foreground">
                "芽" is the new sprout of a plant, symbolizing a new beginning and a new cycle in nature. We aim to use fresh, organic ingredients to bring delicious food to our customers.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a 
                    href={user ? "/my-orders" : "/track"} 
                    className="hover:text-foreground"
                  >
                    {user ? "My Orders" : "Track Order"}
                  </a>
                </li>
                <li><a href="https://www.facebook.com/people/YUM-YUM-%E8%8A%BD%E8%8A%BD/61575848334127/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Hours</h4>
              <div className="text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Mon-Sun: 11:00 AM - 10:00 PM
                </p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 YUM-YUM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
