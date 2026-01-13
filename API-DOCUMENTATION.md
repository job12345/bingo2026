# 📡 API Documentation - Bingo Party Enterprise

**เอกสาร API ฉบับสมบูรณ์**

> เอกสารนี้อธิบายการใช้งาน REST API และ WebSocket Events ทั้งหมดของระบบ Bingo Party Enterprise

**เวอร์ชัน**: 1.0
**วันที่อัพเดท**: 12 มกราคม 2026
**Base URL (Development)**: `http://localhost:8001`
**Base URL (Production)**: `https://api.bingoparty.com`

---

## 📑 สารบัญ

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Error Codes](#error-codes)
4. [Rate Limiting](#rate-limiting)
5. [REST API Endpoints](#rest-api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#users-endpoints)
   - [Wallet](#wallet-endpoints)
   - [Rooms](#rooms-endpoints)
   - [Game](#game-endpoints)
   - [Admin](#admin-endpoints)
6. [WebSocket Events](#websocket-events)
7. [Examples](#examples)

---

## 🎯 API Overview

### Base Information

```
Protocol: HTTPS (Production), HTTP (Development)
Content-Type: application/json
Authentication: JWT Bearer Token
WebSocket: Socket.io v4.6
```

### API Versioning

```
Current Version: v1
Future Versions: /api/v2/... (เมื่อมีการเปลี่ยนแปลงใหญ่)
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "สำเร็จ"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "ยอดเงินไม่เพียงพอ",
    "details": {
      "required": 500,
      "current": 200
    }
  }
}
```

---

## 🔐 Authentication

### Google OAuth Flow

```
1. Frontend → Redirect to /auth/google
2. User Approves → Google redirects to /auth/google/callback
3. Backend → Returns JWT Access Token + Refresh Token
4. Frontend → Store tokens in localStorage
5. Frontend → Use Access Token in Authorization header
```

### JWT Token Format

**Access Token:**
- Type: `Bearer`
- Lifetime: `15 minutes`
- Header: `Authorization: Bearer <access_token>`

**Refresh Token:**
- Lifetime: `7 days`
- Use: Refresh Access Token when expired
- Endpoint: `POST /auth/refresh`

### Authorization Header

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ❌ Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| **AUTH_REQUIRED** | 401 | ต้องเข้าสู่ระบบก่อน |
| **INVALID_TOKEN** | 401 | Token ไม่ถูกต้องหรือหมดอายุ |
| **FORBIDDEN** | 403 | ไม่มีสิทธิ์เข้าถึง |
| **USER_BANNED** | 403 | บัญชีถูกระงับ |
| **INSUFFICIENT_BALANCE** | 400 | ยอดเงินไม่เพียงพอ |
| **ROOM_FULL** | 400 | ห้องเต็ม |
| **INVALID_INPUT** | 400 | ข้อมูลไม่ถูกต้อง |
| **GAME_ALREADY_STARTED** | 400 | เกมเริ่มแล้ว |
| **CARD_NOT_FOUND** | 404 | ไม่พบการ์ด |
| **INVALID_BINGO** | 400 | Bingo ไม่ถูกต้อง |
| **RATE_LIMIT_EXCEEDED** | 429 | ส่ง Request มากเกินไป |
| **SERVER_ERROR** | 500 | เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ |

---

## 🚦 Rate Limiting

### Global Rate Limit

```
Default: 100 requests / 1 minute / IP
```

### Endpoint-specific Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /auth/refresh` | 10 req | 1 min |
| `POST /wallet/deposit` | 5 req | 1 min |
| `POST /wallet/withdraw` | 3 req | 1 min |
| `POST /game/:id/bingo` | 20 req | 1 min |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1673510400
```

---

## 🔌 REST API Endpoints

## Authentication Endpoints

### 1. Google OAuth - Redirect

```http
GET /auth/google
```

**Description**: เริ่มต้น Google OAuth Flow

**Response**: Redirect to Google OAuth Consent Screen

**Example**:

```html
<a href="http://localhost:8001/auth/google">Login with Google</a>
```

---

### 2. Google OAuth - Callback

```http
GET /auth/google/callback
```

**Description**: Google redirect กลับมาพร้อม code (จัดการโดย Backend)

**Query Params**:
- `code` (string, required) - Google Authorization Code

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "displayName": "John Doe",
      "profilePicture": "https://lh3.googleusercontent.com/...",
      "role": "player",
      "pointBalance": 0
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

---

### 3. Refresh Access Token

```http
POST /auth/refresh
```

**Description**: สร้าง Access Token ใหม่ด้วย Refresh Token

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Error**: 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Refresh Token ไม่ถูกต้องหรือหมดอายุ"
  }
}
```

---

### 4. Logout

```http
POST /auth/logout
```

**Description**: ออกจากระบบ (ลบ Refresh Token)

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "message": "ออกจากระบบสำเร็จ"
}
```

---

## Users Endpoints

### 1. Get Current User

```http
GET /users/me
```

**Description**: ดูข้อมูลผู้ใช้ตัวเอง

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "id": "user_123abc",
    "email": "user@example.com",
    "displayName": "John Doe",
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "role": "player",
    "pointBalance": 1500,
    "isBanned": false,
    "createdAt": "2026-01-12T10:00:00.000Z"
  }
}
```

---

### 2. Update Profile

```http
PATCH /users/me
```

**Description**: อัพเดทข้อมูลโปรไฟล์

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "displayName": "John Smith",
  "bankAccount": {
    "bankName": "ธนาคารกสิกรไทย",
    "accountNumber": "1234567890",
    "accountName": "John Smith"
  }
}
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "id": "user_123abc",
    "displayName": "John Smith",
    "bankAccount": { ... }
  }
}
```

---

### 3. Get User Statistics

```http
GET /users/me/statistics
```

**Description**: ดูสถิติการเล่นของตัวเอง

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "gamesPlayed": 150,
    "gamesWon": 45,
    "winRate": 30.0,
    "totalWinnings": 15000,
    "totalLosses": 7500,
    "netProfit": 7500,
    "favoritePattern": "horizontal_1"
  }
}
```

---

## Wallet Endpoints

### 1. Get Balance

```http
GET /wallet/balance
```

**Description**: ดูยอดเงินคงเหลือ

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "balance": 1500
  }
}
```

---

### 2. Deposit Request

```http
POST /wallet/deposit
```

**Description**: สร้างคำขอฝากเงิน (รอ Admin อนุมัติ)

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "amount": 500,
  "paymentSlipUrl": "https://example.com/slip_123.jpg",
  "notes": "ฝากผ่าน PromptPay"
}
```

**Validation**:
- `amount` ≥ 100 และ ≤ 100,000 บาท

**Response**: 201 Created

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn_abc123",
      "type": "deposit",
      "amount": 500,
      "status": "pending",
      "paymentSlipUrl": "https://example.com/slip_123.jpg",
      "notes": "ฝากผ่าน PromptPay",
      "createdAt": "2026-01-12T10:00:00.000Z"
    }
  },
  "message": "สร้างคำขอฝากเงินสำเร็จ รอ Admin อนุมัติ"
}
```

**Error**: 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "จำนวนเงินต้องอยู่ระหว่าง 100-100,000 บาท"
  }
}
```

---

### 3. Withdraw Request

```http
POST /wallet/withdraw
```

**Description**: สร้างคำขอถอนเงิน

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "amount": 300,
  "notes": "ถอนเงิน"
}
```

**Validation**:
- `amount` ≤ User Balance
- User ต้องมีข้อมูลบัญชีธนาคาร

**Response**: 201 Created

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn_def456",
      "type": "withdraw",
      "amount": 300,
      "status": "pending",
      "createdAt": "2026-01-12T10:00:00.000Z"
    }
  },
  "message": "สร้างคำขอถอนเงินสำเร็จ รอ Admin อนุมัติ"
}
```

**Error**: 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "ยอดเงินไม่เพียงพอ",
    "details": {
      "requested": 300,
      "available": 200
    }
  }
}
```

---

### 4. Get Transactions

```http
GET /wallet/transactions
```

**Description**: ดูประวัติธุรกรรม

**Headers**:

```
Authorization: Bearer <access_token>
```

**Query Params**:
- `type` (string, optional) - `deposit` | `withdraw` | `game_win` | `game_loss`
- `status` (string, optional) - `pending` | `completed` | `rejected`
- `limit` (number, optional, default: 20) - จำนวนรายการต่อหน้า
- `offset` (number, optional, default: 0) - เริ่มต้นจากรายการที่

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "type": "deposit",
        "amount": 500,
        "status": "completed",
        "createdAt": "2026-01-12T10:00:00.000Z",
        "processedAt": "2026-01-12T10:05:00.000Z"
      },
      {
        "id": "txn_def456",
        "type": "game_win",
        "amount": 900,
        "status": "completed",
        "gameId": "game_789",
        "createdAt": "2026-01-12T11:00:00.000Z"
      }
    ],
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Rooms Endpoints

### 1. Get All Rooms

```http
GET /rooms
```

**Description**: ดูรายการห้องทั้งหมด

**Query Params**:
- `status` (string, optional) - `waiting` | `playing` | `finished`
- `ballSet` (string, optional) - `75` | `90`

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "room_001",
        "name": "ห้อง VIP 🌟",
        "drawMode": "auto",
        "ballSet": "75",
        "cardPrice": 100,
        "maxPlayers": 10,
        "currentPlayers": 7,
        "status": "waiting",
        "feePercentage": 10,
        "currentPot": 700,
        "createdAt": "2026-01-12T10:00:00.000Z"
      }
    ],
    "total": 15
  }
}
```

---

### 2. Create Room

```http
POST /rooms
```

**Description**: สร้างห้องใหม่

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "name": "ห้องของฉัน",
  "drawMode": "auto",
  "ballSet": "75",
  "maxPlayers": 10,
  "maxRounds": 50,
  "cardPrice": 100,
  "maxCardsPerPlayer": 3,
  "feePercentage": 10
}
```

**Validation**:
- `maxPlayers`: 2-20
- `cardPrice`: 50-10,000
- `maxCardsPerPlayer`: 1-10
- `feePercentage`: 0-20

**Response**: 201 Created

```json
{
  "success": true,
  "data": {
    "room": {
      "id": "room_new123",
      "name": "ห้องของฉัน",
      "drawMode": "auto",
      "ballSet": "75",
      "cardPrice": 100,
      "maxPlayers": 10,
      "status": "waiting",
      "createdAt": "2026-01-12T10:00:00.000Z"
    }
  }
}
```

---

### 3. Get Room Details

```http
GET /rooms/:roomId
```

**Description**: ดูรายละเอียดห้อง

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "room": {
      "id": "room_001",
      "name": "ห้อง VIP 🌟",
      "drawMode": "auto",
      "ballSet": "75",
      "cardPrice": 100,
      "maxPlayers": 10,
      "currentPlayers": 7,
      "status": "waiting",
      "feePercentage": 10,
      "currentPot": 700,
      "players": [
        {
          "id": "user_123",
          "displayName": "Player A",
          "profilePicture": "https://...",
          "cardsCount": 2
        }
      ]
    }
  }
}
```

---

## Game Endpoints

### 1. Join Room

```http
POST /game/:roomId/join
```

**Description**: เข้าร่วมห้อง

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "gameId": "game_abc123",
    "roomId": "room_001",
    "state": "sitting",
    "message": "เข้าร่วมห้องสำเร็จ"
  }
}
```

**Error**: 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "ROOM_FULL",
    "message": "ห้องเต็ม"
  }
}
```

---

### 2. Leave Room

```http
POST /game/:roomId/leave
```

**Description**: ออกจากห้อง

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "message": "ออกจากห้องสำเร็จ"
}
```

---

### 3. Buy Cards

```http
POST /game/:gameId/buy-cards
```

**Description**: ซื้อการ์ดบิงโก

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "quantity": 2
}
```

**Validation**:
- `quantity` ≤ `maxCardsPerPlayer`
- User Balance ≥ `quantity * cardPrice`
- Game State = `buying`

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "card_001",
        "gameId": "game_abc123",
        "numbers": [
          [1, 16, 31, 46, 61],
          [2, 17, 32, 47, 62],
          [3, 18, 0, 48, 63],
          [4, 19, 33, 49, 64],
          [5, 20, 34, 50, 65]
        ],
        "cardHash": "sha256_hash_here"
      },
      {
        "id": "card_002",
        "gameId": "game_abc123",
        "numbers": [ ... ]
      }
    ],
    "newBalance": 1300,
    "totalCost": 200
  }
}
```

**Error**: 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "ยอดเงินไม่เพียงพอ",
    "details": {
      "required": 200,
      "current": 150
    }
  }
}
```

---

### 4. Claim Bingo

```http
POST /game/:gameId/bingo
```

**Description**: กด Bingo!

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "cardId": "card_001",
  "pattern": "horizontal_1"
}
```

**Validation**:
- Card belongs to User
- Card belongs to Game
- Pattern is valid (ครบตามที่กำหนด)
- Card hasn't won yet

**Response**: 200 OK (Win)

```json
{
  "success": true,
  "data": {
    "isWinner": true,
    "pattern": "horizontal_1",
    "payout": 900,
    "newBalance": 2200,
    "gameEnded": true
  },
  "message": "ยินดีด้วย! คุณชนะเกม"
}
```

**Response**: 200 OK (Not First)

```json
{
  "success": true,
  "data": {
    "isWinner": false,
    "reason": "มีผู้เล่นอื่นชนะก่อน",
    "winner": {
      "displayName": "Player A"
    }
  },
  "message": "ไม่ชนะ"
}
```

**Error**: 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_BINGO",
    "message": "Pattern ยังไม่ครบ",
    "details": {
      "missingNumbers": [61, 62]
    }
  }
}
```

---

### 5. Get Game State

```http
GET /game/:gameId
```

**Description**: ดูสถานะเกมปัจจุบัน

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "game": {
      "id": "game_abc123",
      "roomId": "room_001",
      "state": "running",
      "currentRound": 12,
      "drawnNumbers": [1, 5, 12, 23, 45, 61, 72, 15, 38, 49, 55, 68],
      "totalPot": 1000,
      "players": [
        {
          "id": "user_123",
          "displayName": "Player A",
          "cardsCount": 2,
          "hasWon": false
        }
      ]
    }
  }
}
```

---

## Admin Endpoints

> **ต้องมีสิทธิ์ `admin` เท่านั้น**

### 1. Get Pending Transactions

```http
GET /admin/transactions/pending
```

**Description**: ดูรายการฝาก-ถอนที่รอดำเนินการ

**Headers**:

```
Authorization: Bearer <admin_access_token>
```

**Query Params**:
- `type` (string, optional) - `deposit` | `withdraw`

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "type": "deposit",
        "amount": 500,
        "status": "pending",
        "user": {
          "id": "user_123",
          "displayName": "John Doe",
          "email": "john@example.com"
        },
        "paymentSlipUrl": "https://example.com/slip_123.jpg",
        "createdAt": "2026-01-12T10:00:00.000Z"
      }
    ],
    "total": 15
  }
}
```

---

### 2. Approve Transaction

```http
POST /admin/transactions/:transactionId/approve
```

**Description**: อนุมัติฝาก/ถอน

**Headers**:

```
Authorization: Bearer <admin_access_token>
```

**Request Body** (Optional):

```json
{
  "notes": "ตรวจสอบแล้ว อนุมัติ"
}
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn_abc123",
      "status": "completed",
      "processedAt": "2026-01-12T10:05:00.000Z",
      "processedBy": "admin_001"
    },
    "user": {
      "id": "user_123",
      "newBalance": 500
    }
  },
  "message": "อนุมัติธุรกรรมสำเร็จ"
}
```

---

### 3. Reject Transaction

```http
POST /admin/transactions/:transactionId/reject
```

**Description**: ปฏิเสธฝาก/ถอน

**Headers**:

```
Authorization: Bearer <admin_access_token>
```

**Request Body**:

```json
{
  "reason": "สลิปไม่ชัดเจน"
}
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn_abc123",
      "status": "rejected",
      "rejectionReason": "สลิปไม่ชัดเจน",
      "processedAt": "2026-01-12T10:05:00.000Z"
    }
  },
  "message": "ปฏิเสธธุรกรรมสำเร็จ"
}
```

---

### 4. Get All Users

```http
GET /admin/users
```

**Description**: ดูรายชื่อผู้ใช้ทั้งหมด

**Headers**:

```
Authorization: Bearer <admin_access_token>
```

**Query Params**:
- `role` (string, optional) - `player` | `admin` | `bot`
- `isBanned` (boolean, optional)
- `limit`, `offset` (pagination)

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "john@example.com",
        "displayName": "John Doe",
        "role": "player",
        "pointBalance": 1500,
        "isBanned": false,
        "createdAt": "2026-01-12T10:00:00.000Z"
      }
    ],
    "total": 150
  }
}
```

---

### 5. Ban User

```http
POST /admin/users/:userId/ban
```

**Description**: แบนผู้ใช้

**Headers**:

```
Authorization: Bearer <admin_access_token>
```

**Request Body**:

```json
{
  "reason": "ตรวจพบการโกง",
  "notes": "พบการใช้ Bot"
}
```

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "isBanned": true,
      "banReason": "ตรวจพบการโกง",
      "bannedAt": "2026-01-12T10:00:00.000Z",
      "bannedBy": "admin_001"
    }
  },
  "message": "แบนผู้ใช้สำเร็จ"
}
```

---

### 6. Unban User

```http
POST /admin/users/:userId/unban
```

**Description**: ปลดแบน

**Headers**:

```
Authorization: Bearer <admin_access_token>
```

**Response**: 200 OK

```json
{
  "success": true,
  "message": "ปลดแบนสำเร็จ"
}
```

---

### 7. Get Financial Report

```http
GET /admin/reports/financial
```

**Description**: รายงานการเงิน

**Headers**:

```
Authorization: Bearer <admin_access_token>
```

**Query Params**:
- `startDate` (string, ISO 8601) - วันที่เริ่มต้น
- `endDate` (string, ISO 8601) - วันที่สิ้นสุด

**Response**: 200 OK

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDeposits": 50000,
      "totalWithdrawals": 30000,
      "totalFees": 10000,
      "netRevenue": 10000,
      "activeUsers": 150
    },
    "daily": [
      {
        "date": "2026-01-12",
        "deposits": 5000,
        "withdrawals": 3000,
        "fees": 1000,
        "revenue": 1000
      }
    ]
  }
}
```

---

## 🔌 WebSocket Events

### Connection

**URL**: `ws://localhost:8002` (Development)

**Authentication**:

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:8002', {
  auth: {
    token: 'your_jwt_access_token'
  }
});
```

---

### Client → Server Events

#### 1. join_room

```javascript
socket.emit('join_room', {
  roomId: 'room_001'
});
```

**Response**: `player_joined` (Broadcast)

---

#### 2. leave_room

```javascript
socket.emit('leave_room', {
  roomId: 'room_001'
});
```

**Response**: `player_left` (Broadcast)

---

#### 3. send_message (Phase 2)

```javascript
socket.emit('send_message', {
  roomId: 'room_001',
  content: 'สวัสดีครับ!'
});
```

**Response**: `new_message` (Broadcast)

---

### Server → Client Events

#### 1. player_joined

```javascript
socket.on('player_joined', (data) => {
  console.log(data);
  // {
  //   roomId: 'room_001',
  //   player: {
  //     id: 'user_123',
  //     displayName: 'Player A',
  //     profilePicture: 'https://...'
  //   },
  //   currentPlayers: 8
  // }
});
```

---

#### 2. player_left

```javascript
socket.on('player_left', (data) => {
  console.log(data);
  // {
  //   roomId: 'room_001',
  //   playerId: 'user_123',
  //   currentPlayers: 7
  // }
});
```

---

#### 3. game_state_changed

```javascript
socket.on('game_state_changed', (data) => {
  console.log(data);
  // {
  //   gameId: 'game_abc123',
  //   state: 'buying',
  //   message: 'เริ่มระยะซื้อการ์ด (60 วินาที)'
  // }
});
```

**States**: `sitting` → `buying` → `running` → `finished`

---

#### 4. number_drawn

```javascript
socket.on('number_drawn', (data) => {
  console.log(data);
  // {
  //   gameId: 'game_abc123',
  //   number: 23,
  //   ball: 'N-23',
  //   round: 12,
  //   drawnNumbers: [1, 5, 12, 23, ...],
  //   timestamp: '2026-01-12T10:00:00.000Z'
  // }
});
```

---

#### 5. bingo_claimed

```javascript
socket.on('bingo_claimed', (data) => {
  console.log(data);
  // {
  //   gameId: 'game_abc123',
  //   player: {
  //     id: 'user_123',
  //     displayName: 'Player A'
  //   },
  //   pattern: 'horizontal_1',
  //   isValid: true
  // }
});
```

---

#### 6. game_ended

```javascript
socket.on('game_ended', (data) => {
  console.log(data);
  // {
  //   gameId: 'game_abc123',
  //   winner: {
  //     id: 'user_123',
  //     displayName: 'Player A',
  //     profilePicture: 'https://...'
  //   },
  //   pattern: 'horizontal_1',
  //   payout: 900,
  //   totalRounds: 12
  // }
});
```

---

#### 7. payout_completed

```javascript
socket.on('payout_completed', (data) => {
  console.log(data);
  // {
  //   gameId: 'game_abc123',
  //   winner: 'user_123',
  //   amount: 900,
  //   fee: 100,
  //   timestamp: '2026-01-12T10:00:00.000Z'
  // }
});
```

---

#### 8. error

```javascript
socket.on('error', (error) => {
  console.error(error);
  // {
  //   code: 'ROOM_FULL',
  //   message: 'ห้องเต็ม'
  // }
});
```

---

## 📘 Examples

### Example 1: Login & Get User Info

```bash
# 1. Redirect to Google OAuth
curl http://localhost:8001/auth/google

# 2. After Google redirect, get tokens (automatic)

# 3. Get current user
curl -X GET http://localhost:8001/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**JavaScript (Frontend)**:

```javascript
// 1. Login
window.location.href = 'http://localhost:8001/auth/google';

// 2. After redirect, extract tokens from URL/Cookie
const { accessToken, refreshToken } = parseTokens();

// 3. Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 4. Get user info
const response = await fetch('http://localhost:8001/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
console.log(data.data); // User object
```

---

### Example 2: Deposit Flow

```bash
# 1. Create deposit request
curl -X POST http://localhost:8001/wallet/deposit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "paymentSlipUrl": "https://example.com/slip.jpg",
    "notes": "ฝากผ่าน PromptPay"
  }'

# Response: { "transaction": { "id": "txn_abc123", "status": "pending" } }

# 2. Admin approves (Admin Dashboard)
curl -X POST http://localhost:8001/admin/transactions/txn_abc123/approve \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "notes": "อนุมัติ" }'

# 3. Check balance
curl -X GET http://localhost:8001/wallet/balance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Response: { "balance": 500 }
```

---

### Example 3: Complete Game Flow

```javascript
// 1. Get available rooms
const rooms = await fetch('http://localhost:8001/rooms').then(r => r.json());

// 2. Join room
const joinRes = await fetch(`http://localhost:8001/game/${roomId}/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const { gameId } = await joinRes.json();

// 3. Connect WebSocket
const socket = io('ws://localhost:8002', {
  auth: { token: accessToken }
});

socket.emit('join_room', { roomId });

// 4. Listen for game state changes
socket.on('game_state_changed', (data) => {
  if (data.state === 'buying') {
    // Buy cards
    fetch(`http://localhost:8001/game/${gameId}/buy-cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: 2 })
    });
  }
});

// 5. Listen for number drawn
socket.on('number_drawn', (data) => {
  console.log(`Number drawn: ${data.number}`);
  // Auto-mark cards
  checkBingo(data.drawnNumbers);
});

// 6. Claim bingo
function claimBingo(cardId, pattern) {
  fetch(`http://localhost:8001/game/${gameId}/bingo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cardId, pattern })
  });
}

// 7. Listen for game ended
socket.on('game_ended', (data) => {
  console.log(`Winner: ${data.winner.displayName}`);
});
```

---

## 📊 สรุป

เอกสาร API Documentation นี้ครอบคลุม:

1. ✅ **API Overview** - ข้อมูลพื้นฐาน Response Format
2. ✅ **Authentication** - Google OAuth + JWT
3. ✅ **Error Codes** - ครบถ้วนทุก Error
4. ✅ **Rate Limiting** - ป้องกัน Abuse
5. ✅ **REST API Endpoints** - ครบทุก Module
   - Authentication (4 endpoints)
   - Users (3 endpoints)
   - Wallet (4 endpoints)
   - Rooms (3 endpoints)
   - Game (5 endpoints)
   - Admin (7 endpoints)
6. ✅ **WebSocket Events** - Real-time Events
7. ✅ **Examples** - ตัวอย่างการใช้งานจริง

---

**เอกสารนี้จัดทำโดย**: เม (Technical Writer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: ✅ **Complete**

---

## 🔗 Resources

- [Swagger API Docs](http://localhost:8001/api) - Interactive API Documentation
- [Postman Collection](./postman/Bingo-Party.postman_collection.json) - Import ใน Postman
- [WebSocket Testing Tool](https://socket.io/docs/v4/client-api/) - ทดสอบ WebSocket

---

**ขอให้มีความสุขกับการพัฒนานะคะที่รัก!** 🚀💕
