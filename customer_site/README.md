# 👔 MENSVERSE — 3D Animated Men's Fashion E-Commerce Store

> **Experience Fashion in 3D Real-Time**  
> A modern, premium, dark-luxury men's fashion e-commerce platform with an interactive rotatable 3D mannequin as its core differentiator.

---

## 🌟 Highlights & Features

- **Interactive 3D Virtual Fitting Room**:
  - Rotate mannequin 360° (auto-rotate or touch/drag controls)
  - Zoom in/out and preset views (Front, Side, Back)
  - Smooth outfit morphing transitions between categories (Shirts, Hoodies, Jackets, Sherwanis, Blazers, Pants, Shoes)
  - Color swatch selector with instant material reflection
  - Size selector with disabled out-of-stock states
  - Direct Add-to-Cart & 1-Click Buy Now from viewer

- **Storefront & Catalog**:
  - Hero section with animated R3F studio lights
  - Featured curated collections (Summer Luxe, Urban Vanguard, Royal Heritage)
  - Category filters & multi-field search
  - Quick View 3D launcher

- **Admin Management Portal** (`/admin`):
  - Dashboard KPI stats (Revenue, Orders, Products, Users)
  - CRUD for Products & GLB 3D model uploads
  - Instant storefront & 3D viewer sync without rebuild or manual redeploy
  - Order status tracking workflow (`Order Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`)

- **Cart & Razorpay-Ready Checkout**:
  - Slide-over cart drawer with quantity steppers & free shipping calculation
  - Address collection & payment method selector (UPI, Credit Card, Debit Card, Cash on Delivery)

- **Authentication & User Profiles**:
  - JWT authentication & password hashing
  - Order history tracking timeline

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Zustand, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, Bcryptjs, Multer |
| **Database** | MongoDB (Mongoose schemas: Product, Collection, User, Order) |
| **Payments** | Razorpay-ready abstraction layer |
| **Storage** | Multer local storage / Cloudinary ready |

---

## ⚡ Quick Start & Run Instructions

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Setup Server
```bash
cd server
npm install

# Seed demo catalog, collections, and admin account
npm run seed

# Start API server (port 5000)
npm run dev
```

### 3. Setup Client
```bash
cd client
npm install

# Start Vite dev server (port 5173)
npm run dev
```

---

## 🔐 Credentials for Demo

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@mensverse.com` | `adminpassword123` |
| **User** | `john@example.com` | `password123` |

---

## 📁 Directory Structure

```
/shop
├── /client                  # React + Vite + R3F Frontend
│   ├── /src
│   │   ├── /api             # Axios instance & interceptors
│   │   ├── /components
│   │   │   ├── /3d          # MannequinViewer, ViewerControls, ProductDetailPanel
│   │   │   ├── /layout      # Navbar, Footer
│   │   │   └── /ui          # CartDrawer
│   │   ├── /pages           # Home, Shop, ThreeDExperiencePage, Checkout, OrderTracking, Profile, Auth
│   │   │   └── /admin       # Dashboard, Products, Collections, Orders
│   │   ├── /store           # Zustand stores (authStore, cartStore, uiStore)
│   │   ├── App.jsx
│   │   └── index.css        # Dark luxury design system tokens
│   ├── index.html
│   └── vite.config.js
└── /server                  # Node.js + Express Backend
    ├── /config              # DB connection & Cloudinary setup
    ├── /controllers         # Auth, Product, Collection, Order, Admin, Upload
    ├── /middleware          # JWT verify & Admin guard
    ├── /models              # User, Product, Collection, Order
    ├── /routes              # Express routes
    ├── index.js             # API entry point
    └── seed.js              # Seed data script
```
