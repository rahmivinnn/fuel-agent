# Fuel Friend Driver App - PWA

## Overview
A comprehensive Progressive Web App (PWA) for fuel delivery drivers. Manage orders, track customers, handle wallet transactions, and configure settings - all designed for worldwide use with a modern, mobile-first interface.

## Recent Changes (October 15, 2025)
- ✅ Complete schema definitions for Driver, Order, Transaction, Wallet entities
- ✅ All 11 screens implemented: Landing, Login, 3-step Registration, Email Verification, Dashboard, Track Customer, All Orders, Wallet, Settings, 404
- ✅ Design system configured with orange-red primary color (HSL 15 85% 55%), Inter typography
- ✅ Backend API routes for authentication, orders, wallet, transactions
- ✅ In-memory storage with mock data for testing
- ✅ PWA manifest and icons configured
- ✅ Dark mode support via ThemeProvider
- ✅ Bottom navigation for mobile UX

## Project Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query for server state
- **Theme**: Light/Dark mode with ThemeProvider

### Backend (Express + TypeScript)
- **Framework**: Express.js
- **Storage**: In-memory storage (MemStorage)
- **Validation**: Zod schemas
- **Session**: Express session (configured)

### Design System
- **Primary Color**: Orange-red `hsl(15 85% 55%)`
- **Typography**: Inter font family
- **Spacing**: 4/8/12/16/24/32px scale
- **Border Radius**: Subtle (rounded-md for cards/buttons)
- **Elevation**: Subtle shadows on interactive elements

## Key Features

### 1. Authentication Flow
- Landing page with hero section
- Login with email/phone + password
- Multi-step registration (3 steps):
  - Step 1: Personal info (name, email, phone, password)
  - Step 2: Banking details (bank name, account info, payment method)
  - Step 3: Email verification with OTP
- Email verification success screen

### 2. Order Management
- **Dashboard**: Quick stats (earnings, trips) + active orders
- **All Orders**: Tabbed interface (New/Active/History)
  - New: Accept or decline orders
  - Active: Call, message, or track customer
  - History: View completed/canceled orders
- **Track Customer**: Real-time location tracking (map placeholder)

### 3. Wallet System
- Virtual wallet card display
- Set withdrawal amount with quick amounts
- Multiple payment methods (PayPal, Credit Card, Apple Pay)
- Transaction history with status badges

### 4. Settings & Profile
- Driver profile card with avatar
- Settings menu items with icons
- Theme toggle (light/dark mode)
- Logout functionality

## File Structure

```
├── client/
│   └── src/
│       ├── components/
│       │   ├── ui/           # Shadcn components
│       │   ├── BottomNav.tsx
│       │   ├── OrderCard.tsx
│       │   └── ThemeProvider.tsx
│       ├── pages/
│       │   ├── Landing.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── EmailVerification.tsx
│       │   ├── VerifyCode.tsx
│       │   ├── VerifySuccess.tsx
│       │   ├── Dashboard.tsx
│       │   ├── TrackCustomer.tsx
│       │   ├── AllOrders.tsx
│       │   ├── Wallet.tsx
│       │   ├── Settings.tsx
│       │   └── not-found.tsx
│       ├── App.tsx
│       └── index.css       # Design tokens
├── server/
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # In-memory storage
├── shared/
│   └── schema.ts          # Shared types & schemas
├── public/
│   ├── manifest.json      # PWA manifest
│   └── fuel-friend-icon.svg
└── design_guidelines.md   # Design system documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Driver login
- `POST /api/auth/register` - Driver registration (both steps)
- `POST /api/auth/send-verification` - Send email verification code
- `POST /api/auth/verify-code` - Verify OTP code

### Driver
- `GET /api/driver/:id` - Get driver profile
- `PATCH /api/driver/:id` - Update driver profile

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id` - Update order
- `POST /api/orders/:id/accept` - Accept order
- `POST /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/complete` - Complete order

### Wallet
- `GET /api/wallet/driver/:driverId` - Get driver wallet
- `PATCH /api/wallet/:id` - Update wallet
- `POST /api/wallet/withdraw` - Create withdrawal

### Transactions
- `GET /api/transactions/driver/:driverId` - Get driver transactions
- `POST /api/transactions` - Create transaction

## Mock Data
Test credentials:
- Email: `shah@fuelfriend.com`
- Password: `password123`

## User Preferences
- Mobile-first design approach
- Consistent styling across all screens
- Bottom navigation always visible (h-16)
- Orange-red primary color for CTAs
- Designed for worldwide use
- Dark mode support

## Running the Project
The workflow "Start application" runs `npm run dev`:
- Express server for backend
- Vite dev server for frontend
- Both served on same port (0.0.0.0:5000)
- Auto-restart on file changes

## Next Steps
- [ ] Add real-time tracking with actual maps API
- [ ] Implement push notifications
- [ ] Add service worker for offline support
- [ ] Connect to production database
- [ ] Implement actual email verification service
- [ ] Add analytics and monitoring
