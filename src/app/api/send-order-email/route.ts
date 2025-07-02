import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, orderId, customerName, items, totalAmount, isPickup, address } = body

    // For now, we'll just log the email content
    // In a real application, you would integrate with an email service like SendGrid, Nodemailer, etc.
    
    const emailContent = {
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <h2>Order Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Here are the details:</p>
        
        <h3>Order ID: ${orderId}</h3>
        
        <h3>Items Ordered:</h3>
        <ul>
          ${items.map((item: any) => `
            <li>${item.name} - Quantity: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
          `).join('')}
        </ul>
        
        <h3>Total Amount: $${totalAmount.toFixed(2)}</h3>
        
        <h3>Delivery Information:</h3>
        <p>${isPickup ? 'Pickup Order' : `Delivery Address: ${address}`}</p>
        
        <p>You can track your order status using the Order ID: <strong>${orderId}</strong></p>
        <p>Visit our tracking page and enter your Order ID to see real-time updates.</p>
        
        <p>Thank you for choosing our restaurant!</p>
        
        <hr>
        <p><small>This is an automated email. Please do not reply to this message.</small></p>
      `
    }

    // Log the email content (in production, send actual email)
    console.log('📧 Order Confirmation Email:', emailContent)

    // Simulate email sending success
    return NextResponse.json({
      message: 'Email sent successfully',
      emailSent: true
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 