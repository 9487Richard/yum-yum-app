import { NextRequest, NextResponse } from 'next/server'
import { db, foods } from '@/lib/db/connection'
import { verifyAdminAuth } from '@/lib/auth'
import { createId } from '@paralleldrive/cuid2'

// GET /api/foods - List all menu items
export async function GET() {
  try {
    // Select only the columns that exist in the database
    const allFoods = await db.select({
      id: foods.id,
      category: foods.category,
      name: foods.name,
      description: foods.description,
      imageUrl: foods.imageUrl,
      createdAt: foods.createdAt,
      updatedAt: foods.updatedAt
    }).from(foods)
    
    // Transform the data to match frontend expectations
    const transformedFoods = allFoods.map(food => ({
      id: food.id,
      category: food.category,
      name: food.name,
      description: food.description,
      image_url: food.imageUrl || "/api/placeholder/300/200",
      price: "25.99", // Default price since column doesn't exist
      created_at: food.createdAt?.toISOString(),
      updated_at: food.updatedAt?.toISOString()
    }))
    
    return NextResponse.json(transformedFoods)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch foods' },
      { status: 500 }
    )
  }
}

// POST /api/foods - Add new food (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, name, description, image_url } = body

    if (!category || !name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['salt', 'sweet'].includes(category)) {
      return NextResponse.json(
        { error: 'Category must be either "salt" or "sweet"' },
        { status: 400 }
      )
    }

    // Insert into database (only using existing columns)
    const [newFood] = await db.insert(foods).values({
      id: createId(),
      category,
      name,
      description,
      imageUrl: image_url || "/api/placeholder/300/200"
    }).returning({
      id: foods.id,
      category: foods.category,
      name: foods.name,
      description: foods.description,
      imageUrl: foods.imageUrl,
      createdAt: foods.createdAt,
      updatedAt: foods.updatedAt
    })

    return NextResponse.json({
      id: newFood.id,
      category: newFood.category,
      name: newFood.name,
      description: newFood.description,
      image_url: newFood.imageUrl,
      price: "25.99", // Default price
      created_at: newFood.createdAt?.toISOString(),
      updated_at: newFood.updatedAt?.toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create food' },
      { status: 500 }
    )
  }
} 