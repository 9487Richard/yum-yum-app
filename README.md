# 芽 YUM-YUM Restaurant App

A modern restaurant website built with Next.js and shadcn/ui, featuring customer ordering and admin management.

## 🌱 About

"芽" (sprout) symbolizes freshness, new beginnings, and nature's cycle. We aim to use fresh, organic ingredients to bring delicious food to our customers.

## ✨ Features

### Customer Features
- **Menu Browsing**: View salt and sweet food categories
- **Online Ordering**: Place orders for delivery or pickup
- **Order Tracking**: Track order status with Order ID
- **Guest Checkout**: No registration required
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Password Protection**: Secure admin portal
- **Menu Management**: Add, edit, delete menu items
- **Order Management**: View and update order statuses
- **Revenue Analytics**: Lifetime and daily revenue reports

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui + Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yum-yum-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file and fill in your values
cp .env.example .env.local
```

4. Set up the database (see DATABASE_SETUP.md for detailed instructions):
```bash
# Generate database migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed with initial data
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Customer Journey
1. Visit the homepage
2. Browse menu items (Salt Food / Sweet Food)
3. Click "Order Now" to place an order
4. Fill in contact details and select items
5. Choose delivery or pickup
6. Submit order and receive Order ID
7. Track order at `/track?orderId=YOUR_ORDER_ID`

### Admin Access
1. Click "Admin" in the header
2. Enter password: `admin123`
3. Manage menu items, orders, and view reports

## 🔗 API Endpoints

### Public Endpoints
- `GET /api/foods` - List all menu items
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details (for tracking)

### Admin Endpoints (require `x-admin-password: admin123` header)
- `POST /api/foods` - Add new food item
- `PUT /api/foods/[id]` - Update food item
- `DELETE /api/foods/[id]` - Delete food item
- `GET /api/orders` - List all orders
- `PUT /api/orders/[id]` - Update order status
- `GET /api/reports/lifetime-revenue` - Get total revenue
- `GET /api/reports/daily-revenue` - Get daily revenue data

## 📊 Data Structure

### Food Item
```typescript
{
  id: string
  category: 'salt' | 'sweet'
  name: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
}
```

### Order
```typescript
{
  id: string
  customer_name: string
  email: string
  address?: string
  pickup: boolean
  items: Array<{id: string, name: string, quantity: number}>
  special_instructions: string
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Completed' | 'Cancelled'
  total_amount: number
  created_at: string
  updated_at: string
}
```

## 🎨 UI Components

The app uses shadcn/ui components:
- `Button` - Primary actions
- `Card` - Content containers
- `Input` / `Textarea` - Form fields
- `Select` - Dropdowns
- `Tabs` - Navigation
- `Badge` - Status indicators

## ✅ Database & Cloud Integration

- **✅ Neon PostgreSQL**: Production-ready database with Drizzle ORM
- **✅ Cloudinary**: Image upload, optimization, and management
- **✅ Database Migrations**: Automated schema management
- **✅ Data Seeding**: Initial data population scripts

## 📈 Future Enhancements

- **User Authentication**: Member login with NextAuth.js
- **Payment Integration**: Stripe or similar payment processor
- **Real-time Updates**: WebSocket for order status updates
- **Email Notifications**: Order confirmations and updates
- **Advanced Analytics**: More detailed reporting and insights

## 🔒 Security Notes

- Admin password is hardcoded for demo purposes
- In production, implement proper authentication
- Add rate limiting and input validation
- Use environment variables for sensitive data

## 📝 License

This project is created for demonstration purposes.

## 🤝 Contributing

This is a demo project. For production use, please implement proper security measures and database integration.

---

Built with ❤️ using Next.js and shadcn/ui
