import { NextRequest, NextResponse } from 'next/server'
import { db, foods } from '@/lib/db/connection'
import { verifyAdminAuth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

// GET /api/foods/[id] - Get single food item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [food] = await db.select({
      id: foods.id,
      category: foods.category,
      name: foods.name,
      description: foods.description,
      imageUrl: foods.imageUrl,
      createdAt: foods.createdAt,
      updatedAt: foods.updatedAt
    }).from(foods).where(eq(foods.id, params.id))
    
    if (!food) {
      return NextResponse.json(
        { error: 'Food not found' },
        { status: 404 }
      )
    }

    // Transform data to match frontend expectations
    const transformedFood = {
      id: food.id,
      category: food.category,
      name: food.name,
      description: food.description,
      image_url: food.imageUrl || "/api/placeholder/300/200",
      price: "25.99", // Default price since column doesn't exist
      created_at: food.createdAt?.toISOString(),
      updated_at: food.updatedAt?.toISOString()
    }

    return NextResponse.json(transformedFood)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food' },
      { status: 500 }
    )
  }
}

// PUT /api/foods/[id] - Update food item (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { category, name, description, image_url, price } = body

    // Check if food exists
    const [existingFood] = await db.select({
      id: foods.id,
      category: foods.category,
      name: foods.name,
      description: foods.description,
      imageUrl: foods.imageUrl,
      createdAt: foods.createdAt,
      updatedAt: foods.updatedAt
    }).from(foods).where(eq(foods.id, params.id))
    
    if (!existingFood) {
      return NextResponse.json(
        { error: 'Food not found' },
        { status: 404 }
      )
    }

    if (category && !['salt', 'sweet'].includes(category)) {
      return NextResponse.json(
        { error: 'Category must be either "salt" or "sweet"' },
        { status: 400 }
      )
    }

    // Update the food item (only using existing columns)
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (category) updateData.category = category
    if (name) updateData.name = name
    if (description) updateData.description = description
    if (image_url) updateData.imageUrl = image_url

    const [updatedFood] = await db
      .update(foods)
      .set(updateData)
      .where(eq(foods.id, params.id))
      .returning({
        id: foods.id,
        category: foods.category,
        name: foods.name,
        description: foods.description,
        imageUrl: foods.imageUrl,
        createdAt: foods.createdAt,
        updatedAt: foods.updatedAt
      })

    return NextResponse.json({
      id: updatedFood.id,
      category: updatedFood.category,
      name: updatedFood.name,
      description: updatedFood.description,
      image_url: updatedFood.imageUrl,
      price: "25.99", // Default price
      created_at: updatedFood.createdAt?.toISOString(),
      updated_at: updatedFood.updatedAt?.toISOString()
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to update food' },
      { status: 500 }
    )
  }
}

// DELETE /api/foods/[id] - Delete food item (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the food item first
    const [foodToDelete] = await db.select({
      id: foods.id,
      name: foods.name
    }).from(foods).where(eq(foods.id, params.id))
    
    if (!foodToDelete) {
      return NextResponse.json(
        { error: 'Food not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await db.delete(foods).where(eq(foods.id, params.id))

    return NextResponse.json({ 
      message: 'Food deleted successfully',
      deleted: {
        id: foodToDelete.id,
        name: foodToDelete.name
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to delete food' },
      { status: 500 }
    )
  }
} 