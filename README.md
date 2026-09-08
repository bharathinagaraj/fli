# ShopLogo — Full-Stack E-Commerce (Flipkart-style)

A complete e-commerce web app with a React 19 + Vite + Tailwind 4 frontend and an
Express + Sequelize + **MySQL** backend. Includes auth (JWT), product catalog,
search & filters, cart, wishlist, checkout with addresses, and orders.

## Tech Stack

| Layer     | Tools                                                              |
| --------- | ------------------------------------------------------------------ |
| Frontend  | React 19, Vite, Tailwind CSS 4, React Router 7, lucide-react       |
| Backend   | Node.js, Express, Sequelize ORM                                    |
| Database  | MySQL 8                                                             |
| Auth      | JSON Web Tokens (JWT), bcrypt password hashing                     |
| Payment   | Demo checkout (UPI collect flow, Card form, Gift Card, Cash on Delivery) — no real gateway |

## Project Structure

```
fli/
├── src/
│   ├── backend/            # Express + Sequelize API
│   │   ├── config/         # database.js (Sequelize/MySQL), env loading
│   │   ├── controllers/    # auth, product, category, cart, wishlist,
│   │   │                   # order, address, review
│   │   ├── models/         # User, Category, Product, Address, Cart,
│   │   │                   # CartItem, Wishlist, Order, OrderItem, Review
│   │   ├── middleware/     # auth (protect/adminOnly), error handling
│   │   ├── routes/         # REST route definitions
│   │   ├── .env            # DB creds, JWT secret, PORT
│   │   ├── seed.js         # seeds demo data (idempotent)
│   │   ├── server.js       # entry point (port 5000)
│   │   └── app.js          # Express app setup
│   ├── components/ui/      # React frontend
│   │   ├── context/        # Auth, Cart, Wishlist providers (live API)
│   │   ├── hooks/          # useCart, useAuth, useProducts, useWishlist
│   │   ├── services/       # api client + auth/product/cart/order/etc.
│   │   ├── pages/          # Home, Products, ProductDetails, Cart,
│   │   │                   # Checkout, Login, Register, Profile,
│   │   │                   # Orders, OrderDetails, Wishlist, NotFound
│   │   ├── head/           # Header, Footer, ProductCard, etc.
│   │   └── routes/         # AppRoutes (public/protected)
│   └── lib/format.js       # ₹ price formatting (en-IN)
├── package.json            # scripts for backend + frontend
├── vite.config.js          # proxy /api and /uploads → :5000
└── .env                    # VITE_API_URL
```

## Prerequisites

- Node.js 18+
- MySQL 8.0 running locally (default port 3306)

## Setup (Step by Step)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Create a database in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS shoplogo_db;
```

Edit `src/backend/.env` with your MySQL credentials:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=shoplogo_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql
PORT=5000
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
```

> The backend auto-creates all tables on startup (`sequelize.sync()`), so no
> migration step is required.

### 3. Seed demo data

```bash
npm run seed
```

This creates (idempotently):

- **422 products** across 12 top-level categories + 64 subcategories (76 total) with 284 brands
- **2 fresh demo users** (old demo logins are auto-deleted on seed):
  - `admin@flipkart.store` / `Admin@1234` (role: admin)
  - `customer@flipkart.store` / `Customer@1234` (role: customer)
- 12 product reviews and 1 default shipping address

### 4. Run the backend

```bash
npm run dev:server
```

The API runs on **http://localhost:5000** and serves under `/api`.

### 5. Run the frontend

```bash
npm run dev:client
```

Open **http://localhost:5173**. Vite proxies `/api` and `/uploads` to the backend.

> Tip: run both with two terminals, or set `VITE_API_URL=http://localhost:5000/api`
> in the root `.env` (already set) to point the client at a remote backend.

## Features

- **Auth**: register, login, JWT session restore, profile update, role-based admin routes
- **Catalog**: 422 seeded products, 12 top-level + 64 subcategories, search, brand/price/rating filters, sorting, pagination
- **Product page**: image gallery, color variants, ratings & reviews, wishlist toggle
- **Cart**: server-backed cart, quantity updates, promo codes (`SAVE10` = 10%, `WELCOME` = 5%), price breakdown in ₹
- **Checkout**: saved addresses (add/select), UPI collect flow (app + PIN + txn ID), card, gift card or COD payment, order placement with stock validation & transaction rollback
- **Orders**: list with status filter, detail page with status timeline and item snapshots
- **Wishlist**: persistent per-user, add/remove, quick add-to-cart
- **Product status checker**: background job (every 15 min by default, tunable via `PRODUCT_STATUS_CHECK_INTERVAL_MS`) scans products and automatically advances a persistent `status` column (`Active` / `Out of Stock` / `Inactive` / `Missing Images`) based on `isActive`, `stockQuantity` and images, and auto-fixes data issues (negative stock, invalid image URLs). Admin can run it on demand via `GET /api/products/status`.
- **Order status checker**: background job that automatically advances every order `Processing → Shipped → Delivered` on a timer and auto-cancels unpaid non-COD orders after 30 min. Delays are tunable via `ORDER_PROCESSING_TO_SHIPPED_MS`, `ORDER_SHIPPED_TO_DELIVERED_MS`, `ORDER_AUTO_CANCEL_AFTER_MS`.
- **Flipkart-style UI**: blue header `#2874f0`, `#ffe500` accents, ₹ `en-IN` pricing

## API Overview (all under `/api`)

| Method | Endpoint               | Description                  | Auth   |
| ------ | ---------------------- | ---------------------------- | ------ |
| POST   | `/auth/register`       | Register user                | —      |
| POST   | `/auth/login`          | Login → token                | —      |
| GET    | `/auth/me`             | Current user                 | ✔      |
| PATCH  | `/auth/me`             | Update profile               | ✔      |
| GET    | `/products`            | List/search/filter (paginated) | —    |
| GET    | `/products/featured`   | Featured products            | —      |
| GET    | `/products/:id`        | Product detail               | —      |
| GET    | `/products/:id/reviews`| Product reviews              | —      |
| POST   | `/products/:id/reviews`| Create review                | ✔      |
| GET    | `/products/status`     | Product status report (auto-checks + auto-fixes) | ✔ admin |
| GET    | `/categories`          | Category tree                | —      |
| GET    | `/cart`                | Get cart                     | ✔      |
| POST   | `/cart/items`          | Add to cart                  | ✔      |
| PATCH  | `/cart/items/:id`      | Update quantity              | ✔      |
| DELETE | `/cart/items/:id`      | Remove item                  | ✔      |
| DELETE | `/cart`                | Clear cart                   | ✔      |
| POST   | `/cart/promo`          | Apply promo code             | ✔      |
| GET    | `/wishlist`            | Get wishlist                 | ✔      |
| POST   | `/wishlist/:productId` | Add to wishlist              | ✔      |
| DELETE | `/wishlist/:productId` | Remove from wishlist         | ✔      |
| GET    | `/addresses`           | List addresses               | ✔      |
| POST   | `/addresses`           | Add address                  | ✔      |
| PATCH  | `/addresses/:id/default` | Set default address        | ✔      |
| GET    | `/orders`              | List orders (status filter)  | ✔      |
| GET    | `/orders/my/summary`   | Products bought (orders, items, spent, list) | ✔ |
| GET    | `/orders/:id`          | Order detail                 | ✔      |
| POST   | `/orders`              | Place order                  | ✔      |
| POST   | `/orders/:id/cancel`   | Cancel order                 | ✔      |

## Promo Codes (demo)

- `SAVE10` — 10% off subtotal
- `WELCOME` — 5% off subtotal

## Troubleshooting

- **`Access denied for user 'root'`** — fix `DB_USER`/`DB_PASSWORD` in `src/backend/.env`.
- **Port 5000 already in use** — change `PORT` in `src/backend/.env` and restart.
- **Tables not created** — the backend calls `sequelize.sync()` on boot; ensure MySQL is running first.
- **Cart/orders empty after login** — data is per-user; log in with a seeded demo account.
