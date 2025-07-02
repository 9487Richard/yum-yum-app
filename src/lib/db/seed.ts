import { db, foods } from './index'

const seedFoods = [
  {
    category: 'salt',
    name: "Signature Salt Ramen",
    description: "Rich tonkotsu broth with fresh noodles, chashu pork, and seasonal vegetables",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
    price: '18.99',
    isAvailable: true
  },
  {
    category: 'salt',
    name: "Miso Glazed Salmon",
    description: "Fresh salmon glazed with house-made miso sauce, served with steamed rice",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
    price: '24.99',
    isAvailable: true
  },
  {
    category: 'salt',
    name: "Vegetable Curry Bowl",
    description: "Aromatic curry with seasonal vegetables and jasmine rice",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop",
    price: '16.99',
    isAvailable: true
  },
  {
    category: 'sweet',
    name: "Matcha Cheesecake",
    description: "Creamy cheesecake infused with premium matcha powder",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
    price: '12.99',
    isAvailable: true
  },
  {
    category: 'sweet',
    name: "Mochi Ice Cream",
    description: "Traditional mochi filled with artisanal ice cream flavors",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop",
    price: '8.99',
    isAvailable: true
  },
  {
    category: 'sweet',
    name: "Dorayaki Pancakes",
    description: "Fluffy pancakes filled with sweet red bean paste",
    imageUrl: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&h=600&fit=crop",
    price: '10.99',
    isAvailable: true
  }
]

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')
    
    // Insert seed data
    await db.insert(foods).values(seedFoods)
    
    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Failed to seed database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} 