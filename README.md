# Yum Yum Restaurant App

A modern restaurant ordering system built with Next.js, featuring user authentication, order management, and admin dashboard.

## Features

### Customer Features
- 🍽️ Browse menu with categories
- 🛒 Add items to cart and place orders
- 👤 User registration and authentication
- 📧 Email order confirmations
- 📱 Order tracking and history
- 🚚 Delivery and pickup options

### Admin Features
- 🔐 Secure admin authentication
- 📊 Order management dashboard
- 🍕 Menu item management (add, edit, delete)
- 📈 Real-time order tracking
- 🖼️ Image upload via Cloudinary

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT with bcrypt
- **Image Storage**: Cloudinary
- **Email**: Nodemailer
- **ORM**: Drizzle ORM

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- Cloudinary account for image uploads

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/yum-yum-app.git
cd yum-yum-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
# Database
DATABASE_URL=your_postgresql_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## Admin Access

- URL: `/admin/login`
- Password: `9487`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Food Items
- `GET /api/foods` - Get all available food items
- `POST /api/foods` - Add new food item (admin only)
- `PUT /api/foods/[id]` - Update food item (admin only)
- `DELETE /api/foods/[id]` - Delete food item (admin only)

### Orders
- `GET /api/orders` - Get orders (admin: all, user: own orders)
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get specific order
- `PUT /api/orders/[id]` - Update order status (admin only)

### Other
- `POST /api/upload` - Upload image to Cloudinary
- `POST /api/send-order-email` - Send order confirmation email

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.
