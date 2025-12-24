# FuelFriend Agent API Documentation

## Base URL
```
http://localhost:4000/api
```

## Response Format
All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Success",
  "responseCode": "RC_200",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid credentials",
  "responseCode": "RC_A001",
  "error": "Email/password salah",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Response Codes
| Code | Message | Description |
|------|---------|-------------|
| RC_200 | Success | Operation successful |
| RC_201 | Created successfully | Resource created |
| RC_400 | Bad request | Invalid request |
| RC_401 | Unauthorized | Authentication required |
| RC_404 | Not found | Resource not found |
| RC_A001 | Invalid credentials | Login failed |
| RC_O001 | OTP sent successfully | OTP delivered |
| RC_O002 | Invalid OTP | Wrong OTP code |
| RC_O003 | OTP expired | OTP timeout |
| RC_W001 | WhatsApp not connected | WhatsApp service down |
| RC_E001 | Email send failed | Email delivery failed |

## Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "emailOrPhone": "admin@fuelfriend.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "responseCode": "RC_200",
  "data": {
    "customer": {
      "id": "1",
      "fullName": "Admin User",
      "email": "admin@fuelfriend.com",
      "isEmailVerified": true
    },
    "token": "jwt_token_here"
  }
}
```

### Google Authentication
```http
POST /auth/google
Content-Type: application/json

{
  "uid": "google_uid",
  "email": "user@gmail.com",
  "displayName": "John Doe"
}
```

### Registration Step 1
```http
POST /auth/register/step1
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "081234567890",
  "password": "password123"
}
```

### Complete Registration
```http
POST /auth/register/complete
Content-Type: application/json

{
  "step1": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "081234567890",
    "password": "password123"
  },
  "step2": {
    "brand": "Toyota",
    "color": "Red",
    "licenseNumber": "B1234XYZ",
    "fuelType": "Premium"
  }
}
```

### Email Verification
```http
POST /auth/email-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify Code
```http
POST /auth/verify-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "emailOrPhone": "user@example.com"
}
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "newpassword123"
}
```

## OTP Endpoints

### Send Email OTP
```http
POST /auth/otp/email/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify Email OTP
```http
POST /auth/otp/email/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Send WhatsApp OTP
```http
POST /auth/otp/whatsapp/send
Content-Type: application/json

{
  "phoneNumber": "081234567890"
}
```

### Verify WhatsApp OTP
```http
POST /auth/otp/whatsapp/verify
Content-Type: application/json

{
  "phoneNumber": "081234567890",
  "otp": "123456"
}
```

### WhatsApp Status
```http
GET /auth/otp/whatsapp/status
```

### Restart WhatsApp
```http
POST /auth/otp/whatsapp/restart
```

## Core API Endpoints

### Health Check
```http
GET /health
```

### Fuel Stations
```http
GET /stations
GET /stations/search?q=shell
GET /stations/:id
```

### Fuel Friends (Drivers)
```http
GET /fuel-friends
GET /fuel-friends/:id
```

### Orders
```http
GET /orders
GET /orders?status=pending
GET /orders?driverId=123
POST /orders
GET /orders/:id
GET /orders/customer/:customerId
GET /orders/customer/:customerId/status/:status
PATCH /orders/:id/status
POST /orders/:id/accept
POST /orders/:id/cancel
```

**Create Order:**
```json
{
  "customerId": "cust123",
  "deliveryAddress": "Jl. Sudirman No. 1",
  "deliveryPhone": "081234567890",
  "fuelType": "Premium",
  "fuelQuantity": "10.00",
  "totalAmount": "150000",
  "deliveryFee": "15000"
}
```

### Customers
```http
GET /customers/:id
PATCH /customers/:id
POST /customers/:id/change-password
```

### Vehicles
```http
GET /vehicles/customer/:customerId
POST /vehicles
PATCH /vehicles/:id
DELETE /vehicles/:id
```

### Payment Methods
```http
GET /payment-methods/customer/:customerId
POST /payment-methods
DELETE /payment-methods/:id
```

### Reviews
```http
GET /reviews/:targetType/:targetId
POST /reviews
```

**Add Review:**
```json
{
  "customerId": "cust123",
  "orderId": "order123",
  "targetType": "fuel_friend",
  "targetId": "driver123",
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Notifications
```http
POST /notifications/new-order
GET /notifications/customer/:customerId
PATCH /notifications/:id/read
DELETE /notifications/:id
```

### Drivers
```http
POST /drivers/:id/fcm-token
```

### Wallet & Transactions
```http
GET /wallet/driver/:driverId
PUT /wallet/driver/:driverId
GET /transactions/driver/:driverId
```

### Payments
```http
POST /payments/create-intent
POST /payments/withdraw
```

**Payment Intent:**
```json
{
  "amount": 150000,
  "currency": "idr"
}
```

**Withdraw:**
```json
{
  "amount": "100000",
  "email": "driver@example.com",
  "method": "paypal"
}
```

### Chat
```http
GET /chat/order/:orderId
POST /chat
```

## Testing Endpoints

### Test Order Creation
```http
POST /auth/test/create-order
```

### Resend Contact
```http
POST /auth/resend/contact
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

## Authentication
Most endpoints require JWT token in Authorization header:
```http
Authorization: Bearer <jwt_token>
```

## Error Handling
All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error
- 503: Service Unavailable

## Rate Limiting
- 100 requests per 15 minutes per IP
- Rate limit headers included in response

## Environment Variables
```env
NODE_ENV=development
PORT=4000
JWT_SECRET=your-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@fuelfriend.com
SIMULATE_EMAIL_SENDING=true
WHATSAPP_SESSION_PATH=whatsapp-auth
```