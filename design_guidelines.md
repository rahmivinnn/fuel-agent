# Fuel Friend Driver PWA - Design Guidelines

## Design Approach

**Selected Approach:** Hybrid (Utility-focused with modern visual appeal)
- **Justification:** This is a delivery driver application requiring efficiency and clarity, but also needs visual appeal for driver engagement and trust
- **Primary References:** Uber Driver App, DoorDash Dasher, Grab Driver for interaction patterns
- **Design System Foundation:** Material Design principles adapted for mobile-first PWA

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 15 85% 55% (Orange-red for CTAs, active states)
- Secondary: 220 15% 25% (Dark blue-gray for text)
- Background: 0 0% 98% (Off-white)
- Surface: 0 0% 100% (White cards)
- Success: 140 60% 45% (Green for completed)
- Warning: 40 95% 55% (Yellow-orange for pending)
- Error: 0 70% 50% (Red for canceled)
- Border: 220 15% 85% (Light gray)

**Dark Mode:**
- Primary: 15 85% 60% (Lighter orange for contrast)
- Secondary: 220 15% 85% (Light text)
- Background: 220 15% 8% (Dark blue-gray)
- Surface: 220 15% 12% (Elevated cards)
- Maintain same success/warning/error with adjusted luminosity

### B. Typography

**Font Family:**
- Primary: 'Inter' (Google Fonts) for all UI text
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

**Scale:**
- Headings (Screen titles): text-2xl font-bold (24px)
- Subheadings (Greetings): text-xl font-semibold (20px)
- Body (Order details): text-base font-normal (16px)
- Labels (Form inputs): text-sm font-medium (14px)
- Captions (Timestamps): text-xs font-normal (12px)
- Buttons: text-base font-semibold (16px)

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Container padding: px-4 (16px horizontal)
- Card padding: p-4 or p-6 for larger cards
- Section spacing: space-y-4 or space-y-6
- Button padding: px-6 py-3 for primary, px-4 py-2 for secondary
- Bottom nav height: h-16 with safe-area-inset-bottom

**Grid System:**
- Mobile-first: Single column (w-full)
- Cards: Full width with max-w-screen-sm mx-auto
- Two-column actions: grid grid-cols-2 gap-3

### D. Component Library

**Buttons:**
- Primary: Solid orange background, white text, rounded-lg, font-semibold, full-width or auto
- Secondary: Outlined with orange border, orange text, bg-transparent, rounded-lg
- Icon Buttons: Circular (w-10 h-10), centered icon, subtle border
- Disabled: opacity-50, cursor-not-allowed

**Cards (Order Cards):**
- Background: white (dark mode: surface color)
- Border: 1px border-gray-200 (dark: border-gray-700)
- Rounded: rounded-xl
- Shadow: shadow-sm
- Padding: p-4
- Status badge: Absolute top-right, rounded-full, px-3 py-1, text-xs font-medium

**Forms:**
- Input fields: Outlined style, rounded-lg, p-3, border-gray-300 focus:border-primary
- Labels: Above input, text-sm font-medium, mb-2
- Error states: Red border, error text below in text-xs text-red-500
- Multi-step indicator: Horizontal stepper with circles and connecting lines

**Navigation:**
- Bottom Tab Bar: Fixed bottom, h-16, flex justify-around, items-center
- Tab items: flex-col, icon + label, active state with primary color
- Top Bar: Sticky top-0, minimal, with back button where needed

**Status Indicators:**
- Pending: Yellow-orange badge, rounded-full
- Active: Green badge with pulse animation
- Completed: Blue-gray badge
- Canceled: Red badge
- Order number: Bold, text-base, mb-1

**Map Component:**
- Full-height container (h-[60vh])
- Overlay info card: Absolute bottom, rounded-t-2xl, shadow-lg
- Route line: Primary color with opacity
- Markers: Custom driver/customer icons

**Wallet Elements:**
- Card mockup: Gradient background (orange to red), rounded-2xl, p-6
- Amount buttons: Outlined chips, rounded-full, px-4 py-2
- Transaction list: Alternating subtle bg for rows, icon + details + amount

**Modals/Sheets:**
- Bottom sheet for actions: Slide up animation, rounded-t-3xl
- Overlay: bg-black/50 backdrop
- Content: p-6, max-h-[80vh], overflow-y-auto

### E. Animations

**Minimal & Purposeful:**
- Tab switching: Fade transition (150ms)
- Card interactions: Scale on press (active:scale-98)
- Loading states: Spinner or skeleton screens
- Success confirmation: Scale + fade animation (300ms)
- Page transitions: Slide horizontal for navigation, slide up for modals
- NO decorative or scroll-triggered animations

## Screen-Specific Guidelines

**Landing/Auth Screens:**
- Centered logo at top (h-16)
- Form fields stacked with space-y-4
- Primary action button below form
- Social login with divider ("Or continue with")
- Footer link for alternate action (sign up/sign in)

**Registration Multi-Step:**
- Progress indicator at top (3 steps)
- Form sections grouped logically
- Next/Back buttons consistent positioning
- Summary screen (step 3) in read-only cards with edit option

**Dashboard (Home):**
- Greeting header with driver name
- Section headers with "See all" links
- Order request cards with dual actions (Cancel/Accept)
- Current orders with three actions (Call/Message/Track)
- Bottom navigation always visible

**Track Customer:**
- Map takes primary viewport space
- Floating customer info card at bottom
- Delivery time banner at top
- Dual-marker display (driver + customer)

**All Orders:**
- Tab navigation (New/Active/Completed)
- Consistent card layout across tabs
- Action buttons adapt per order state
- Empty states for no orders

**My Wallet:**
- Card visual at top with balance
- Amount quick-select chips
- Payment method selection (icon + label)
- Transaction history list with infinite scroll

## PWA Requirements

**Manifest Configuration:**
- theme_color: Primary orange
- background_color: White/Dark surface
- display: standalone
- orientation: portrait
- icons: 192x192, 512x512 maskable

**Offline Support:**
- Cache critical screens and assets
- Offline indicator banner
- Queue failed actions for retry

**Performance:**
- Lazy load screens/images
- Optimize map loading
- Cache Google Fonts locally

## Accessibility

- WCAG AA contrast ratios maintained
- Touch targets minimum 44px
- Focus visible states on all interactive elements
- Screen reader labels on icons
- Form validation with clear error messages
- Support for system dark mode preference



document.documentElement.classList.toggle('dark');
