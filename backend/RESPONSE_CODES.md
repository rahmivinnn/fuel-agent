# Response Code Mapping

## Format Response API
Setiap response API menggunakan format standar:

```json
{
  "success": boolean,
  "message": string,
  "responseCode": string,
  "data": any,
  "error": string,
  "timestamp": string
}
```

## Daftar Response Code

### Success Codes (2xx)
| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| RC_200 | Success | 200 | Operasi berhasil |
| RC_201 | Created successfully | 201 | Data berhasil dibuat |

### Client Error Codes (4xx)
| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| RC_400 | Bad request | 400 | Request tidak valid |
| RC_401 | Unauthorized | 401 | Tidak memiliki akses |
| RC_403 | Forbidden | 403 | Akses ditolak |
| RC_404 | Not found | 404 | Data tidak ditemukan |
| RC_409 | Conflict | 409 | Data sudah ada |
| RC_422 | Validation error | 422 | Error validasi input |

### Server Error Codes (5xx)
| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| RC_500 | Internal server error | 500 | Error server internal |
| RC_503 | Service unavailable | 503 | Service tidak tersedia |

### Authentication Codes (A)
| Code | Message | Description |
|------|---------|-------------|
| RC_A001 | Invalid credentials | Email/password salah |
| RC_A002 | Token expired | Token sudah expired |
| RC_A003 | Invalid token | Token tidak valid |
| RC_A004 | Account locked | Akun terkunci |

### OTP Codes (O)
| Code | Message | Description |
|------|---------|-------------|
| RC_O001 | OTP sent successfully | OTP berhasil dikirim |
| RC_O002 | Invalid OTP | Kode OTP salah |
| RC_O003 | OTP expired | OTP sudah expired |
| RC_O004 | OTP already used | OTP sudah digunakan |
| RC_O005 | Failed to send OTP | Gagal mengirim OTP |

### User Codes (U)
| Code | Message | Description |
|------|---------|-------------|
| RC_U001 | User not found | User tidak ditemukan |
| RC_U002 | User already exists | User sudah ada |
| RC_U003 | User account inactive | Akun user tidak aktif |

### WhatsApp Codes (W)
| Code | Message | Description |
|------|---------|-------------|
| RC_W001 | WhatsApp not connected | WhatsApp belum terkoneksi |
| RC_W002 | WhatsApp message send failed | Gagal kirim pesan WhatsApp |

### Email Codes (E)
| Code | Message | Description |
|------|---------|-------------|
| RC_E001 | Email send failed | Gagal kirim email |
| RC_E002 | Invalid email format | Format email tidak valid |

## Contoh Penggunaan

### Success Response
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "responseCode": "RC_O001",
  "data": {
    "method": "whatsapp",
    "identifier": "0812****7890"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "WhatsApp not connected",
  "responseCode": "RC_W001",
  "error": "WhatsApp service is not connected. Please scan QR code first.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/send-otp` - Kirim OTP via WhatsApp/Email
- `POST /api/auth/verify-otp` - Verifikasi kode OTP
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/whatsapp-status` - Status koneksi WhatsApp

### Send OTP Request
```json
{
  "identifier": "admin@fuelfriend.com", // email atau nomor HP
  "method": "email" // "email" atau "whatsapp"
}
```

### Verify OTP Request
```json
{
  "identifier": "admin@fuelfriend.com",
  "otp": "123456"
}
```