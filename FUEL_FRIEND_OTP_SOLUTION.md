# Solusi Masalah OTP Email dan Fuel Friends

## Masalah yang Ditemukan

Saat ini sistem verifikasi OTP email **tidak terintegrasi** dengan table `fuel_friends`. Berikut analisis masalahnya:

### 1. Flow OTP Saat Ini
- OTP hanya disimpan di memory (service OTP)
- Verifikasi OTP berhasil tapi tidak membuat record di database
- Table `fuel_friends` kosong karena tidak ada proses registrasi

### 2. Struktur Database
- Table `customers` - untuk user biasa
- Table `fuel_friends` - untuk driver/fuel friend
- Keduanya terpisah dan tidak saling terhubung

## Solusi yang Dibuat

### 1. Controller Baru: `fuelFriendAuth.ts`
Dibuat controller khusus untuk fuel friend dengan 2 endpoint:

#### A. Registrasi Fuel Friend (`/api/fuel-friends/register`)
```javascript
POST /api/fuel-friends/register
{
  "email": "driver@example.com",
  "otp": "123456",
  "fullName": "John Driver",
  "phoneNumber": "+1234567890", 
  "password": "password123",
  "location": "Jakarta",
  "deliveryFee": 5000
}
```

**Flow:**
1. Verifikasi OTP email terlebih dahulu
2. Jika OTP valid, buat record di table `fuel_friends`
3. Return JWT token untuk login

#### B. Login Fuel Friend (`/api/fuel-friends/login`)
```javascript
POST /api/fuel-friends/login
{
  "email": "driver@example.com",
  "password": "password123"
}
```

### 2. Update Routes
Menambahkan route baru di `routes.ts`:
- `/api/fuel-friends/register` - Registrasi dengan OTP
- `/api/fuel-friends/login` - Login fuel friend

### 3. Update Auth Utils
Menambahkan support `userType` dalam JWT token untuk membedakan:
- `customer` - user biasa
- `fuel_friend` - driver

## Cara Penggunaan

### 1. Registrasi Fuel Friend
```bash
# 1. Kirim OTP ke email
POST /api/otp/email/send
{
  "email": "driver@example.com"
}

# 2. Registrasi dengan OTP
POST /api/fuel-friends/register
{
  "email": "driver@example.com",
  "otp": "123456",
  "fullName": "John Driver",
  "phoneNumber": "+1234567890",
  "password": "password123", 
  "location": "Jakarta",
  "deliveryFee": 5000
}
```

### 2. Login Fuel Friend
```bash
POST /api/fuel-friends/login
{
  "email": "driver@example.com",
  "password": "password123"
}
```

## Perbedaan dengan Customer

| Aspek | Customer | Fuel Friend |
|-------|----------|-------------|
| Table | `customers` | `fuel_friends` |
| Registrasi | 2 step (info + vehicle) | 1 step dengan OTP |
| Login | `/api/auth/login` | `/api/fuel-friends/login` |
| JWT userType | `customer` | `fuel_friend` |

## Testing

Untuk test apakah sudah berfungsi:

1. **Kirim OTP email:**
```bash
curl -X POST http://localhost:3000/api/otp/email/send \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

2. **Registrasi fuel friend:**
```bash
curl -X POST http://localhost:3000/api/fuel-friends/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "fullName": "Test Driver",
    "phoneNumber": "+1234567890",
    "password": "password123",
    "location": "Jakarta",
    "deliveryFee": 5000
  }'
```

3. **Cek database:**
```sql
SELECT * FROM fuel_friends WHERE email = 'test@example.com';
```

Sekarang fuel friend akan tersimpan di table `fuel_friends` setelah verifikasi OTP berhasil!