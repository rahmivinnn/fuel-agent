# Database Relations - Fuel Friend Agent

## 📊 **Entity Relationship Diagram**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CUSTOMERS     │    │  FUEL_FRIENDS   │    │ FUEL_STATIONS   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ fullName        │    │ fullName        │    │ name            │
│ email           │    │ email           │    │ address         │
│ phoneNumber     │    │ phoneNumber     │    │ latitude        │
│ password        │    │ password        │    │ longitude       │
│ isEmailVerified │    │ location        │    │ regularPrice    │
│ ...             │    │ deliveryFee     │    │ premiumPrice    │
└─────────────────┘    │ isAvailable     │    │ ...             │
         │              │ ...             │    └─────────────────┘
         │              └─────────────────┘             │
         │                       │                      │
         │                       │                      │
         ▼                       ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    VEHICLES     │    │ FACE_BIOMETRICS │    │    PRODUCTS     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ customerId (FK) │────┤ fuelFriendId(FK)│    │ stationId (FK)  │──┐
│ fuelFriendId(FK)│──┐ │ faceDescriptor  │    │ name            │  │
│ brand           │  │ │ faceImage       │    │ category        │  │
│ color           │  │ │ confidence      │    │ price           │  │
│ licenseNumber   │  │ └─────────────────┘    │ inStock         │  │
│ fuelType        │  │                        └─────────────────┘  │
└─────────────────┘  │                                             │
                     │                                             │
                     └─────────────────────────────────────────────┘
                                           │
                     ┌─────────────────────▼─────────────────────┐
                     │                 ORDERS                    │
                     ├───────────────────────────────────────────┤
                     │ id (PK)                                   │
                     │ trackingNumber                            │
                     │ customerId (FK) ──────────────────────────┼──┐
                     │ stationId (FK) ───────────────────────────┼──┼──┐
                     │ fuelFriendId (FK) ────────────────────────┼──┼──┼──┐
                     │ vehicleId (FK) ───────────────────────────┼──┼──┼──┼──┐
                     │ deliveryAddress                           │  │  │  │  │
                     │ fuelType                                  │  │  │  │  │
                     │ totalAmount                               │  │  │  │  │
                     │ status                                    │  │  │  │  │
                     │ ...                                       │  │  │  │  │
                     └───────────────────────────────────────────┘  │  │  │  │
                                           │                        │  │  │  │
                                           ▼                        │  │  │  │
                     ┌─────────────────────────────────────────────┐  │  │  │  │
                     │              ORDER_ITEMS                    │  │  │  │  │
                     ├─────────────────────────────────────────────┤  │  │  │  │
                     │ id (PK)                                     │  │  │  │  │
                     │ orderId (FK) ───────────────────────────────┼──┘  │  │  │
                     │ productId (FK) ─────────────────────────────┼─────┘  │  │
                     │ productName                                 │        │  │
                     │ quantity                                    │        │  │
                     │ price                                       │        │  │
                     └─────────────────────────────────────────────┘        │  │
                                                                            │  │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │  │
│ PAYMENT_METHODS │    │     REVIEWS     │    │ NOTIFICATIONS   │          │  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤          │  │
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │          │  │
│ customerId (FK) │────┤ customerId (FK) │────┤ customerId (FK) │──────────┘  │
│ type            │    │ orderId (FK)    │────┤ title           │             │
│ cardNumber      │    │ targetType      │    │ message         │             │
│ isDefault       │    │ targetId        │    │ type            │             │
└─────────────────┘    │ rating          │    │ isRead          │             │
                       └─────────────────┘    └─────────────────┘             │
                                                                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│ CHAT_MESSAGES   │    │     WALLETS     │    │ TRANSACTIONS    │             │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤             │
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │             │
│ orderId (FK)    │────┤ fuelFriendId(FK)│────┤ walletId (FK)   │─────────────┘
│ senderId        │    │ balance         │    │ type            │
│ senderType      │    │ currency        │    │ amount          │
│ message         │    │ bankName        │    │ status          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔗 **Relasi Utama:**

### **1. CUSTOMERS (User biasa)**
- `1:N` dengan `VEHICLES` - Customer bisa punya banyak kendaraan
- `1:N` dengan `ORDERS` - Customer bisa buat banyak pesanan
- `1:N` dengan `PAYMENT_METHODS` - Customer bisa punya banyak metode bayar
- `1:N` dengan `REVIEWS` - Customer bisa kasih banyak review
- `1:N` dengan `NOTIFICATIONS` - Customer terima banyak notifikasi

### **2. FUEL_FRIENDS (Driver/Agent)**
- `1:N` dengan `VEHICLES` - Driver bisa punya banyak kendaraan
- `1:N` dengan `ORDERS` - Driver bisa terima banyak pesanan
- `1:1` dengan `FACE_BIOMETRICS` - Driver punya 1 data biometric wajah
- `1:1` dengan `WALLETS` - Driver punya 1 wallet
- Target di `REVIEWS` - Driver bisa di-review customer

### **3. ORDERS (Pesanan)**
- `N:1` dengan `CUSTOMERS` - Banyak order dari 1 customer
- `N:1` dengan `FUEL_FRIENDS` - Banyak order ke 1 driver
- `N:1` dengan `FUEL_STATIONS` - Banyak order dari 1 SPBU
- `N:1` dengan `VEHICLES` - Banyak order pakai 1 kendaraan
- `1:N` dengan `ORDER_ITEMS` - 1 order bisa punya banyak item
- `1:N` dengan `CHAT_MESSAGES` - 1 order bisa punya banyak chat

### **4. FUEL_STATIONS (SPBU)**
- `1:N` dengan `PRODUCTS` - 1 SPBU jual banyak produk
- `1:N` dengan `ORDERS` - 1 SPBU terima banyak pesanan

### **5. WALLETS & TRANSACTIONS**
- `1:1` FUEL_FRIENDS ↔ WALLETS - 1 driver = 1 wallet
- `1:N` WALLETS → TRANSACTIONS - 1 wallet banyak transaksi

## 🎯 **Key Foreign Keys:**

```sql
-- VEHICLES
customerId → customers.id
fuelFriendId → fuel_friends.id

-- ORDERS  
customerId → customers.id
fuelFriendId → fuel_friends.id
stationId → fuel_stations.id
vehicleId → vehicles.id

-- FACE_BIOMETRICS
fuelFriendId → fuel_friends.id

-- WALLETS
fuelFriendId → fuel_friends.id

-- TRANSACTIONS
walletId → wallets.id
```

**Relasi ini memungkinkan tracking lengkap dari customer order → driver assignment → delivery → payment → review cycle.** 🔄