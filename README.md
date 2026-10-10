# ☕ Coffee Home Backend

Backend API cho website bán cà phê Coffee Home Blend.

## Tech Stack

- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** SQLite via Prisma ORM
- **Authentication:** JWT + bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Push database schema
npm run db:push

# Seed sample data
npm run seed

# Start development server
npm run dev
```

Backend sẽ chạy tại `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập (returns {token, user})
- `GET /api/auth/me` - Lấy thông tin user hiện tại (auth required)

### Products
- `GET /api/products` - Danh sách sản phẩm (hỗ trợ filter, search, pagination)
- `GET /api/products/featured` - Sản phẩm nổi bật
- `GET /api/products/:slug` - Chi tiết sản phẩm
- `GET /api/products/:id/reviews` - Đánh giá sản phẩm
- `POST /api/products/:id/reviews` - Thêm đánh giá (auth required)

### Categories
- `GET /api/categories` - Danh sách danh mục

### Orders
- `POST /api/orders` - Tạo đơn hàng (auth required)
- `GET /api/orders` - Danh sách đơn hàng của user (auth required)
- `GET /api/orders/:id` - Chi tiết đơn hàng (auth required)

### Payment
- `POST /api/payment/create` - Tạo thanh toán mock (auth required)
- `POST /api/payment/confirm` - Xác nhận thanh toán (auth required)

### Admin Routes (auth + admin role)
- `GET /api/admin/products` - Danh sách sản phẩm
- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/products/:id` - Cập nhật sản phẩm
- `DELETE /api/admin/products/:id` - Xóa sản phẩm
- `GET /api/admin/orders` - Danh sách đơn hàng
- `PUT /api/admin/orders/:id/status` - Cập nhật trạng thái đơn hàng
- `GET /api/admin/users` - Danh sách users

## Test Credentials

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@coffee.vn  | admin123  |
| User  | user@coffee.vn   | user123   |

## Deploy to Render

1. Fork this repository to GitHub
2. Connect to Render: https://render.com/blueprints
3. Create new Blueprint from your forked repo
4. Render sẽ tự động tạo SQLite database và deploy

Hoặc deploy thủ công:

```bash
# Build
npm run build

# Start production
npm start
```

## Environment Variables

| Variable         | Description                    | Default                    |
|------------------|--------------------------------|----------------------------|
| NODE_ENV         | Environment (development/production) | development          |
| PORT             | Server port                    | 4000                       |
| JWT_SECRET       | Secret key for JWT tokens      | (required)                 |
| DATABASE_URL     | SQLite database path           | file:../data/dev.db        |
| FRONTEND_URL     | Frontend URL for CORS          | http://localhost:5173       |

## Project Structure

```
coffee-home-backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data script
├── src/
│   ├── index.ts         # Express app entry
│   ├── middleware/
│   │   └── auth.ts      # JWT authentication
│   └── routes/
│       ├── admin.ts     # Admin routes
│       ├── auth.ts      # Auth routes
│       ├── categories.ts # Category routes
│       ├── orders.ts    # Order routes
│       ├── payment.ts   # Payment routes
│       └── products.ts  # Product routes
├── data/                # SQLite database files
├── .env.example         # Environment template
├── .gitignore
├── package.json
├── Procfile             # Render deployment
├── render.yaml          # Render blueprint
└── tsconfig.json
```

## License

MIT
