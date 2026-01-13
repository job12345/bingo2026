# 🎯 Bingo Party Enterprise – Backend Design Document

**Backend Developer**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**Tech Stack**: NestJS + TypeScript + Prisma + PostgreSQL + Redis + Socket.io

---

## 📑 สารบัญ

1. [ภาพรวม Backend Architecture](#1-ภาพรวม-backend-architecture)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [API Endpoints (REST)](#4-api-endpoints-rest)
5. [WebSocket Events](#5-websocket-events)
6. [Authentication Flow](#6-authentication-flow)
7. [Game Engine Logic](#7-game-engine-logic)
8. [Anti-Cheat Implementation](#8-anti-cheat-implementation)
9. [Transaction Safety](#9-transaction-safety)
10. [Error Handling](#10-error-handling)
11. [Security Best Practices](#11-security-best-practices)
12. [Performance Optimization](#12-performance-optimization)
13. [Deployment Guide](#13-deployment-guide)

---

## 1. ภาพรวม Backend Architecture

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                              │
│                  http://localhost:3000                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ HTTP / WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Backend API                            │
│                  http://localhost:8001 (REST)                    │
│                  ws://localhost:8002 (WebSocket)                 │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Auth       │  │   Wallet     │  │   Game       │           │
│  │   Module     │  │   Module     │  │   Engine     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Users      │  │   Rooms      │  │   Admin      │           │
│  │   Module     │  │   Module     │  │   Module     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │  WebSocket   │  │   Bot        │                              │
│  │   Gateway    │  │   Module     │                              │
│  └──────────────┘  └──────────────┘                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │    Redis     │ │  File System │
│   Database   │ │ (Cache/Queue)│ │  (Uploads)   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 1.2 Design Principles

1. **Server Authoritative** - Server ตัดสินทุกอย่าง, Client แสดงผลเท่านั้น
2. **ACID Transactions** - ใช้ Database Transaction สำหรับการเงิน
3. **Real-time First** - WebSocket สำหรับ Game Events
4. **Security by Default** - Rate Limiting, Input Validation, SQL Injection Prevention
5. **Scalable Architecture** - รองรับการเติบโต (Redis Queue, Microservices-ready)

### 1.3 Ports & Protocols

| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| **REST API** | 8001 | HTTP | RESTful API Endpoints |
| **WebSocket** | 8002 | WS | Real-time Game Events |
| **PostgreSQL** | 5432 | TCP | Database |
| **Redis** | 6379 | TCP | Cache & Queue |

---

## 2. Tech Stack & Dependencies

### 2.1 Core Technologies

```typescript
{
  "framework": "NestJS v10.3",
  "language": "TypeScript v5.3",
  "orm": "Prisma v5.8",
  "database": "PostgreSQL 16",
  "cache": "Redis v5.3",
  "websocket": "Socket.io v4.6",
  "queue": "Bull v4.12",
  "validation": "class-validator + class-transformer",
  "auth": "Passport.js (Google OAuth + JWT)",
  "documentation": "Swagger (OpenAPI)"
}
```

### 2.2 Key Dependencies

```json
{
  "dependencies": {
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/websockets": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/swagger": "^7.1.17",
    "@nestjs/throttler": "^5.1.1",
    "@prisma/client": "^5.8.1",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "class-validator": "^0.14.1",
    "socket.io": "^4.6.0",
    "ioredis": "^5.3.2",
    "bull": "^4.12.0"
  }
}
```

---

## 3. Project Structure

### 3.1 โครงสร้างโฟลเดอร์

```
bingo-backend/
├── prisma/
│   ├── schema.prisma          # Prisma Schema (Database Models)
│   ├── migrations/            # Database Migrations
│   └── seed.ts                # Seed Data
│
├── src/
│   ├── main.ts                # Application Entry Point
│   ├── app.module.ts          # Root Module
│   │
│   ├── prisma/                # Database Module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── auth/                  # Authentication & Authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── google.strategy.ts   # Google OAuth
│   │   │   └── jwt.strategy.ts      # JWT Validation
│   │   └── dto/
│   │       └── refresh-token.dto.ts
│   │
│   ├── users/                 # User Management
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── wallet/                # Wallet & Transactions
│   │   ├── wallet.module.ts
│   │   ├── wallet.controller.ts
│   │   ├── wallet.service.ts
│   │   └── dto/
│   │       ├── deposit-request.dto.ts
│   │       └── withdraw-request.dto.ts
│   │
│   ├── rooms/                 # Room Management
│   │   ├── rooms.module.ts
│   │   ├── rooms.controller.ts
│   │   ├── rooms.service.ts
│   │   └── dto/
│   │       └── create-room.dto.ts
│   │
│   ├── game/                  # Game Engine
│   │   ├── game.module.ts
│   │   ├── game.controller.ts
│   │   ├── game.service.ts
│   │   ├── game-state.service.ts    # Game State Management
│   │   ├── card-manager.service.ts  # Card Generation & Validation
│   │   ├── bingo-validator.service.ts # Anti-Cheat Validation
│   │   └── dto/
│   │       ├── buy-card.dto.ts
│   │       └── claim-bingo.dto.ts
│   │
│   ├── websocket/             # Real-time Communication
│   │   ├── websocket.module.ts
│   │   ├── websocket.gateway.ts
│   │   └── events/
│   │       ├── game.events.ts
│   │       └── room.events.ts
│   │
│   ├── admin/                 # Admin Panel APIs
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── dto/
│   │       └── approve-transaction.dto.ts
│   │
│   ├── bot/                   # Ghost Bot Logic
│   │   ├── bot.module.ts
│   │   ├── bot.service.ts
│   │   └── bot-player.service.ts
│   │
│   └── common/                # Shared Utilities
│       ├── decorators/
│       │   ├── public.decorator.ts
│       │   ├── roles.decorator.ts
│       │   └── current-user.decorator.ts
│       ├── filters/
│       │   └── http-exception.filter.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   └── roles.guard.ts
│       ├── pipes/
│       ├── interceptors/
│       └── utils/
│           ├── card-generator.util.ts
│           └── hash.util.ts
│
├── uploads/                   # Payment Slips
├── .env.example               # Environment Variables Template
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 4. API Endpoints (REST)

### 4.1 Authentication Endpoints

```typescript
/**
 * @route   GET /auth/google
 * @desc    เริ่มต้น Google OAuth Login
 * @access  Public
 */
GET /auth/google

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth Callback
 * @access  Public
 * @returns { accessToken, refreshToken, user }
 */
GET /auth/google/callback

/**
 * @route   POST /auth/refresh
 * @desc    Refresh Access Token
 * @access  Public
 * @body    { refreshToken: string }
 * @returns { accessToken: string }
 */
POST /auth/refresh

/**
 * @route   POST /auth/logout
 * @desc    Logout (Revoke Refresh Token)
 * @access  Private
 * @body    { refreshToken: string }
 */
POST /auth/logout

/**
 * @route   GET /auth/me
 * @desc    Get Current User Profile
 * @access  Private
 * @returns User Object
 */
GET /auth/me
```

### 4.2 User Endpoints

```typescript
/**
 * @route   GET /users/me
 * @desc    ดูข้อมูลผู้ใช้ปัจจุบัน
 * @access  Private
 */
GET /users/me

/**
 * @route   PUT /users/me
 * @desc    อัปเดตข้อมูลผู้ใช้
 * @access  Private
 * @body    { displayName?, avatarUrl?, bankName?, bankAccountNumber?, bankAccountName? }
 */
PUT /users/me

/**
 * @route   GET /users/me/statistics
 * @desc    ดูสถิติการเล่น
 * @access  Private
 * @returns { totalGamesPlayed, totalWins, winRate, netProfit }
 */
GET /users/me/statistics

/**
 * @route   GET /users/leaderboard
 * @desc    ดู Leaderboard (Top Winners)
 * @access  Private
 * @query   ?limit=10
 */
GET /users/leaderboard

/**
 * @route   GET /users/:id
 * @desc    ดูข้อมูล User ตาม ID
 * @access  Private
 */
GET /users/:id
```

### 4.3 Wallet Endpoints

```typescript
/**
 * @route   GET /wallet/balance
 * @desc    ดูยอดเงิน Point ปัจจุบัน
 * @access  Private
 * @returns { balance: number }
 */
GET /wallet/balance

/**
 * @route   GET /wallet/transactions
 * @desc    ดูประวัติธุรกรรม
 * @access  Private
 * @query   ?page=1&limit=20
 */
GET /wallet/transactions

/**
 * @route   POST /wallet/deposit
 * @desc    ขอเติมเงิน (Deposit Request)
 * @access  Private
 * @body    { amount: number, paymentSlipUrl: string, notes?: string }
 * @returns { message, transaction }
 */
POST /wallet/deposit

/**
 * @route   POST /wallet/withdraw
 * @desc    ขอถอนเงิน (Withdraw Request)
 * @access  Private
 * @body    { amount: number, notes?: string }
 * @returns { message, transaction }
 */
POST /wallet/withdraw

/**
 * @route   GET /wallet/pending
 * @desc    ดูรายการรอ Admin อนุมัติ
 * @access  Private
 */
GET /wallet/pending

/**
 * @route   POST /wallet/cancel/:transactionId
 * @desc    ยกเลิกคำขอ (เฉพาะ Pending)
 * @access  Private
 */
POST /wallet/cancel/:transactionId

/**
 * @route   GET /wallet/summary
 * @desc    ดูสรุปการเงิน
 * @access  Private
 * @returns { currentBalance, totalDeposit, totalWithdraw, totalSpent, totalWon, netProfit }
 */
GET /wallet/summary
```

### 4.4 Room Endpoints

```typescript
/**
 * @route   GET /rooms
 * @desc    ดูรายการห้องทั้งหมด
 * @access  Private
 * @query   ?isActive=true
 */
GET /rooms

/**
 * @route   GET /rooms/:id
 * @desc    ดูรายละเอียดห้อง
 * @access  Private
 */
GET /rooms/:id

/**
 * @route   POST /rooms
 * @desc    สร้างห้องใหม่
 * @access  Private
 * @body    { name, drawMode, ballSet, maxPlayers, maxRounds, cardPrice, maxCardsPerPlayer, feePercentage }
 */
POST /rooms

/**
 * @route   PUT /rooms/:id
 * @desc    แก้ไขการตั้งค่าห้อง (Creator เท่านั้น)
 * @access  Private
 */
PUT /rooms/:id

/**
 * @route   DELETE /rooms/:id
 * @desc    ปิดห้อง (Creator หรือ Admin)
 * @access  Private
 */
DELETE /rooms/:id
```

### 4.5 Game Endpoints

```typescript
/**
 * @route   POST /game/:roomId/join
 * @desc    เข้าร่วมห้อง (Sitting Phase)
 * @access  Private
 */
POST /game/:roomId/join

/**
 * @route   POST /game/:gameId/buy-cards
 * @desc    ซื้อการ์ด (Buying Phase)
 * @access  Private
 * @body    { quantity: number }
 */
POST /game/:gameId/buy-cards

/**
 * @route   POST /game/:gameId/bingo
 * @desc    กด Bingo (Claim Winner)
 * @access  Private
 * @body    { cardId: string, pattern: string }
 */
POST /game/:gameId/bingo

/**
 * @route   GET /game/:gameId
 * @desc    ดูสถานะเกมปัจจุบัน
 * @access  Private
 */
GET /game/:gameId

/**
 * @route   GET /game/:gameId/cards
 * @desc    ดูการ์ดของตัวเอง
 * @access  Private
 */
GET /game/:gameId/cards
```

### 4.6 Admin Endpoints

```typescript
/**
 * @route   GET /admin/transactions/pending
 * @desc    ดูรายการรอ Approve
 * @access  Admin Only
 */
GET /admin/transactions/pending

/**
 * @route   POST /admin/transactions/:id/approve
 * @desc    อนุมัติธุรกรรม (Deposit/Withdraw)
 * @access  Admin Only
 * @body    { notes?: string }
 */
POST /admin/transactions/:id/approve

/**
 * @route   POST /admin/transactions/:id/reject
 * @desc    ปฏิเสธธุรกรรม
 * @access  Admin Only
 * @body    { reason: string }
 */
POST /admin/transactions/:id/reject

/**
 * @route   GET /admin/reports/financial
 * @desc    รายงานทางการเงิน
 * @access  Admin Only
 * @query   ?startDate=...&endDate=...
 */
GET /admin/reports/financial

/**
 * @route   GET /admin/users
 * @desc    ดูรายชื่อผู้ใช้ทั้งหมด
 * @access  Admin Only
 */
GET /admin/users

/**
 * @route   POST /admin/users/:id/ban
 * @desc    แบนผู้ใช้
 * @access  Admin Only
 * @body    { reason: string, bannedUntil?: Date }
 */
POST /admin/users/:id/ban

/**
 * @route   POST /admin/users/:id/unban
 * @desc    ปลดแบนผู้ใช้
 * @access  Admin Only
 */
POST /admin/users/:id/unban
```

### 4.7 Bot Endpoints

```typescript
/**
 * @route   GET /admin/bots
 * @desc    ดูรายการ Bot ทั้งหมด
 * @access  Admin Only
 */
GET /admin/bots

/**
 * @route   POST /admin/bots
 * @desc    สร้าง Ghost Bot ใหม่
 * @access  Admin Only
 * @body    { displayName, maxWinRatePercent, maxConsecutiveWins, ... }
 */
POST /admin/bots

/**
 * @route   PUT /admin/bots/:id
 * @desc    แก้ไขการตั้งค่า Bot
 * @access  Admin Only
 */
PUT /admin/bots/:id

/**
 * @route   DELETE /admin/bots/:id
 * @desc    ลบ Bot
 * @access  Admin Only
 */
DELETE /admin/bots/:id

/**
 * @route   GET /admin/bots/:id/statistics
 * @desc    ดูสถิติ Bot
 * @access  Admin Only
 */
GET /admin/bots/:id/statistics
```

---

## 5. WebSocket Events

### 5.1 Connection

```typescript
// Client → Server
socket.emit('authenticate', { token: 'jwt-token' });

// Server → Client
socket.emit('authenticated', { userId: 'xxx', displayName: 'yyy' });
socket.emit('authentication_failed', { message: 'Invalid token' });
```

### 5.2 Room Events

```typescript
// Client → Server
socket.emit('join_room', { roomId: 'xxx' });
socket.emit('leave_room', { roomId: 'xxx' });

// Server → Client (Broadcast to Room)
socket.emit('player_joined', { userId: 'xxx', displayName: 'yyy' });
socket.emit('player_left', { userId: 'xxx' });
socket.emit('room_state_changed', { state: 'sitting', countdown: 30 });
```

### 5.3 Game Events

```typescript
// Server → Client (Broadcast to Game)
socket.emit('game_started', {
  gameId: 'xxx',
  roundNumber: 1,
  state: 'running',
});

socket.emit('number_drawn', {
  number: 45,
  totalDrawn: 12,
  drawnNumbers: [1, 5, 12, 23, 45, ...],
  timestamp: '2026-01-12T10:30:00Z',
});

socket.emit('bingo_claimed', {
  userId: 'xxx',
  displayName: 'yyy',
  cardId: 'zzz',
  pattern: 'horizontal_1',
  isValid: true,
  rank: 1, // 1 = Winner
});

socket.emit('game_ended', {
  winnerId: 'xxx',
  winnerName: 'yyy',
  pattern: 'horizontal_1',
  payoutAmount: 900.00,
  ballsToWin: 12,
});

socket.emit('payout_completed', {
  winnerId: 'xxx',
  amount: 900.00,
  newBalance: 1900.00,
});
```

### 5.4 Chat Events

```typescript
// Client → Server
socket.emit('send_message', {
  roomId: 'xxx',
  content: 'Hello!',
});

// Server → Client (Broadcast to Room)
socket.emit('new_message', {
  userId: 'xxx',
  displayName: 'yyy',
  avatarUrl: '...',
  content: 'Hello!',
  timestamp: '2026-01-12T10:30:00Z',
});
```

---

## 6. Authentication Flow

### 6.1 Google OAuth Flow

```
┌────────────┐                ┌────────────┐                ┌────────────┐
│  Frontend  │                │  Backend   │                │   Google   │
└─────┬──────┘                └─────┬──────┘                └─────┬──────┘
      │                             │                             │
      │  1. GET /auth/google        │                             │
      ├────────────────────────────>│                             │
      │                             │  2. Redirect to Google      │
      │                             ├────────────────────────────>│
      │                             │                             │
      │  3. User Login              │                             │
      │<─────────────────────────────────────────────────────────┤
      │                             │                             │
      │  4. Callback with Code      │                             │
      ├────────────────────────────>│                             │
      │                             │  5. Exchange Code for Token │
      │                             ├────────────────────────────>│
      │                             │<────────────────────────────┤
      │                             │  6. Get User Profile        │
      │                             ├────────────────────────────>│
      │                             │<────────────────────────────┤
      │                             │                             │
      │                             │  7. Create/Update User      │
      │                             │  8. Generate JWT Tokens     │
      │                             │                             │
      │  9. Redirect with Tokens    │                             │
      │<────────────────────────────┤                             │
      │                             │                             │
```

### 6.2 JWT Token Strategy

```typescript
// Access Token (Short-lived: 1 hour)
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "player",
  "iat": 1705036800,
  "exp": 1705040400 // 1 hour
}

// Refresh Token (Long-lived: 7 days)
{
  "sub": "user-id",
  "type": "refresh",
  "iat": 1705036800,
  "exp": 1705641600 // 7 days
}
```

### 6.3 Protected Route Example

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard) // ✅ ต้อง Login
export class UsersController {
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    // user = { id, email, role, displayName }
    return this.usersService.findById(user.id);
  }

  @Get('admin/dashboard')
  @Roles('admin') // ✅ ต้องเป็น Admin
  @UseGuards(RolesGuard)
  async getAdminDashboard() {
    return this.adminService.getDashboard();
  }
}
```

---

## 7. Game Engine Logic

### 7.1 Game State Machine

```
IDLE (ห้องสร้างใหม่)
  ↓
WAITING_FOR_ROUND (รอเริ่มรอบใหม่)
  ↓ (Countdown 30s)
SITTING_PHASE (ผู้เล่นกด "Sit")
  ↓ (Countdown 30s หรือเต็ม)
BUYING_PHASE (ผู้เล่นซื้อการ์ด)
  ↓ (Countdown 20s)
GAME_RUNNING (สุ่มเลข Auto/Manual)
  ↓ (มีคนกด Bingo)
BINGO_RACE (ตรวจสอบ Bingo Requests)
  ↓ (Server Validate)
WINNER_DECLARED (ประกาศผู้ชนะ)
  ↓
PAYOUT (จ่ายเงิน)
  ↓
COOLDOWN (พัก 10s)
  ↓
WAITING_FOR_ROUND (เริ่มรอบใหม่)
```

### 7.2 Number Drawing Logic

#### Auto Draw (Server-side)

```typescript
class GameStateService {
  async autoDrawNumber(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { room: true },
    });

    // สุ่มเลขที่ยังไม่ออก
    const ballSet = game.room.ballSet === '75' ? 75 : 90;
    const drawnNumbers = game.drawnNumbers || [];
    const availableNumbers = Array.from({ length: ballSet }, (_, i) => i + 1)
      .filter(n => !drawnNumbers.includes(n));

    if (availableNumbers.length === 0) {
      throw new Error('All numbers drawn');
    }

    // สุ่มเลข
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const drawnNumber = availableNumbers[randomIndex];

    // Update Game
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        drawnNumbers: { push: drawnNumber },
        currentBall: drawnNumber,
        totalBallsDrawn: { increment: 1 },
      },
    });

    // Broadcast to WebSocket
    this.websocketGateway.broadcastToGame(gameId, 'number_drawn', {
      number: drawnNumber,
      totalDrawn: drawnNumbers.length + 1,
      drawnNumbers: [...drawnNumbers, drawnNumber],
      timestamp: new Date().toISOString(),
    });

    return drawnNumber;
  }
}
```

### 7.3 Card Generation (75-Ball)

```typescript
class CardGeneratorUtil {
  static generate75BallCard(): number[][] {
    const card: number[][] = [];

    // 5 คอลัมน์: B(1-15) I(16-30) N(31-45) G(46-60) O(61-75)
    for (let col = 0; col < 5; col++) {
      const min = col * 15 + 1;
      const max = col * 15 + 15;
      const numbers = this.getRandomNumbers(min, max, 5);

      for (let row = 0; row < 5; row++) {
        if (!card[row]) card[row] = [];

        // FREE Space ตรงกลาง (2,2)
        if (row === 2 && col === 2) {
          card[row][col] = 0; // 0 = FREE
        } else {
          card[row][col] = numbers.pop()!;
        }
      }
    }

    return card;
  }

  // Card Hash (Anti-Cheat)
  static generateCardHash(numbers: number[][], gameId: string, createdAt: Date): string {
    const data = JSON.stringify(numbers) + gameId + createdAt.toISOString();
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
```

### 7.4 Pattern Validation

```typescript
class BingoValidatorService {
  async validateBingo(
    cardId: string,
    pattern: string,
    drawnNumbers: number[],
  ): Promise<{ isValid: boolean; missingNumbers?: number[] }> {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    const drawnSet = new Set(drawnNumbers);
    const missingNumbers: number[] = [];

    // Pattern Definitions
    const patterns: Record<string, [number, number][]> = {
      horizontal_1: [[0,0],[0,1],[0,2],[0,3],[0,4]],
      horizontal_2: [[1,0],[1,1],[1,2],[1,3],[1,4]],
      horizontal_3: [[2,0],[2,1],[2,2],[2,3],[2,4]],
      horizontal_4: [[3,0],[3,1],[3,2],[3,3],[3,4]],
      horizontal_5: [[4,0],[4,1],[4,2],[4,3],[4,4]],
      vertical_1: [[0,0],[1,0],[2,0],[3,0],[4,0]],
      vertical_2: [[0,1],[1,1],[2,1],[3,1],[4,1]],
      vertical_3: [[0,2],[1,2],[2,2],[3,2],[4,2]],
      vertical_4: [[0,3],[1,3],[2,3],[3,3],[4,3]],
      vertical_5: [[0,4],[1,4],[2,4],[3,4],[4,4]],
      diagonal_1: [[0,0],[1,1],[2,2],[3,3],[4,4]],
      diagonal_2: [[0,4],[1,3],[2,2],[3,1],[4,0]],
      four_corners: [[0,0],[0,4],[4,0],[4,4]],
    };

    const positions = patterns[pattern];
    if (!positions) {
      return { isValid: false };
    }

    for (const [row, col] of positions) {
      const num = card.numbers[row][col];
      if (num === 0) continue; // FREE Space
      if (!drawnSet.has(num)) {
        missingNumbers.push(num);
      }
    }

    return {
      isValid: missingNumbers.length === 0,
      missingNumbers: missingNumbers.length > 0 ? missingNumbers : undefined,
    };
  }
}
```

---

## 8. Anti-Cheat Implementation

### 8.1 Server-side Validation (CRITICAL!)

```typescript
class BingoValidatorService {
  async validateBingoRequest(
    userId: string,
    gameId: string,
    cardId: string,
    pattern: string,
  ): Promise<{ isValid: boolean; reason?: string; details?: any }> {
    // ✅ 1. ตรวจสอบว่า Card เป็นของ User จริง
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== userId) {
      return { isValid: false, reason: 'Card does not belong to user' };
    }

    // ✅ 2. ตรวจสอบว่า Card อยู่ในเกมที่ถูกต้อง
    if (card.gameId !== gameId) {
      return { isValid: false, reason: 'Card does not belong to this game' };
    }

    // ✅ 3. ตรวจสอบว่า Card ยังไม่เคยชนะมาก่อน
    if (card.isWinner) {
      return { isValid: false, reason: 'Card already won' };
    }

    // ✅ 4. ตรวจสอบ Pattern
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    const validation = await this.validatePattern(
      card.numbers,
      pattern,
      game.drawnNumbers,
    );

    if (!validation.isValid) {
      return {
        isValid: false,
        reason: 'Pattern not complete',
        details: validation.missingNumbers,
      };
    }

    // ✅ 5. ตรวจสอบ Timing (Anti-Cheat)
    const lastDrawTime = await this.getLastDrawTime(gameId);
    const requestTime = new Date();
    const latency = requestTime.getTime() - lastDrawTime.getTime();

    if (latency < 200) {
      // คนปกติไม่น่าจะกดได้เร็วกว่า 200ms
      console.warn(`⚠️ Suspicious Bingo: User ${userId} latency ${latency}ms`);
    }

    // ✅ 6. บันทึก Bingo Request (Audit Trail)
    await this.prisma.bingoRequest.create({
      data: {
        gameId,
        userId,
        cardId,
        claimedPattern: pattern,
        isValid: true,
        validationResult: validation,
        ballsWhenRequested: game.drawnNumbers.length,
        requestLatencyMs: latency,
        serverTimestamp: requestTime,
      },
    });

    return { isValid: true };
  }
}
```

### 8.2 Rate Limiting

```typescript
// Global Rate Limiting
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
})

// Per-Endpoint Rate Limiting
@Controller('game')
export class GameController {
  @Post(':gameId/bingo')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 Bingo per minute
  async claimBingo(...) {
    // ...
  }

  @Post(':gameId/buy-cards')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 Buy Card per minute
  async buyCards(...) {
    // ...
  }
}
```

### 8.3 Card Integrity (Hash Verification)

```typescript
// สร้าง Card พร้อม Hash
const card = await this.prisma.card.create({
  data: {
    gameId,
    userId,
    numbers: generatedNumbers,
    cardHash: CardGeneratorUtil.generateCardHash(
      generatedNumbers,
      gameId,
      new Date(),
    ),
    purchasePrice: room.cardPrice,
  },
});

// ตรวจสอบ Hash (ป้องกันการปลอม)
const expectedHash = CardGeneratorUtil.generateCardHash(
  card.numbers,
  card.gameId,
  card.createdAt,
);

if (card.cardHash !== expectedHash) {
  throw new ForbiddenException('Card integrity check failed');
}
```

### 8.4 Suspicious Activity Detection

```sql
-- ตรวจสอบ User ที่กด Bingo เร็วผิดปกติ (< 200ms)
SELECT
  user_id,
  COUNT(*) as suspicious_claims,
  AVG(request_latency_ms) as avg_latency
FROM bingo_requests
WHERE request_latency_ms < 200
GROUP BY user_id
HAVING COUNT(*) > 5;

-- ตรวจสอบ User ที่ชนะบ่อยผิดปกติ (> 50%)
SELECT
  user_id,
  total_games_played,
  total_wins,
  (total_wins::DECIMAL / total_games_played) * 100 as win_rate
FROM users
WHERE total_games_played > 10
  AND (total_wins::DECIMAL / total_games_played) > 0.5
ORDER BY win_rate DESC;
```

---

## 9. Transaction Safety

### 9.1 ACID Transaction Example (Buy Card)

```typescript
async buyCards(userId: string, gameId: string, quantity: number) {
  return this.prisma.$transaction(async (prisma) => {
    // 1. Lock User Row (FOR UPDATE)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // 2. Check Balance
    const totalCost = room.cardPrice * quantity;
    if (user.pointBalance < totalCost) {
      throw new BadRequestException('ยอดเงินไม่เพียงพอ');
    }

    // 3. Deduct Balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pointBalance: { decrement: totalCost },
        totalSpent: { increment: totalCost },
      },
    });

    // 4. Create Transaction Record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'card_purchase',
        amount: totalCost,
        status: 'completed',
        balanceBefore: user.pointBalance,
        balanceAfter: updatedUser.pointBalance,
        metadata: { gameId, quantity, cardPrice: room.cardPrice },
      },
    });

    // 5. Create Cards
    const cards = [];
    for (let i = 0; i < quantity; i++) {
      const numbers = CardGeneratorUtil.generate75BallCard();
      const cardHash = CardGeneratorUtil.generateCardHash(numbers, gameId, new Date());

      const card = await prisma.card.create({
        data: {
          gameId,
          userId,
          numbers,
          cardHash,
          purchasePrice: room.cardPrice,
        },
      });
      cards.push(card);
    }

    // 6. Update Game Pot
    await prisma.game.update({
      where: { id: gameId },
      data: { potSize: { increment: totalCost } },
    });

    return { cards, newBalance: updatedUser.pointBalance };
  });
}
```

### 9.2 Payout Transaction

```typescript
async payoutWinner(gameId: string, winnerId: string, pattern: string) {
  return this.prisma.$transaction(async (prisma) => {
    const game = await prisma.game.findUnique({ where: { id: gameId } });

    // Calculate Payout
    const feeAmount = game.potSize * (game.room.feePercentage / 100);
    const payoutAmount = game.potSize - feeAmount;

    // Update Winner Balance
    const updatedUser = await prisma.user.update({
      where: { id: winnerId },
      data: {
        pointBalance: { increment: payoutAmount },
        totalWins: { increment: 1 },
        totalWon: { increment: payoutAmount },
      },
    });

    // Create Payout Transaction
    await prisma.transaction.create({
      data: {
        userId: winnerId,
        type: 'payout',
        amount: payoutAmount,
        status: 'completed',
        balanceBefore: updatedUser.pointBalance - payoutAmount,
        balanceAfter: updatedUser.pointBalance,
        metadata: { gameId, pattern },
      },
    });

    // Update Game
    await prisma.game.update({
      where: { id: gameId },
      data: {
        state: 'payout',
        winnerId,
        payoutAmount,
        feeAmount,
        endedAt: new Date(),
      },
    });

    // Update Room Statistics
    await prisma.room.update({
      where: { id: game.roomId },
      data: {
        totalPotCollected: { increment: game.potSize },
        totalFeeCollected: { increment: feeAmount },
        topWinnerId: winnerId,
        topWinnerAmount: payoutAmount,
      },
    });

    return { payoutAmount, newBalance: updatedUser.pointBalance };
  });
}
```

---

## 10. Error Handling

### 10.1 Global Exception Filter

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || 'Internal server error',
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Exception:', errorResponse);
    }

    response.status(status).json(errorResponse);
  }
}
```

### 10.2 Custom Exceptions

```typescript
// Not Found
throw new NotFoundException('User not found');

// Bad Request
throw new BadRequestException('ยอดเงินไม่เพียงพอ');

// Forbidden
throw new ForbiddenException('Access denied');

// Unauthorized
throw new UnauthorizedException('Invalid or expired token');

// Conflict
throw new ConflictException('Email already exists');
```

---

## 11. Security Best Practices

### 11.1 Input Validation (class-validator)

```typescript
export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEnum(DrawMode)
  drawMode: DrawMode;

  @IsEnum(BallSet)
  ballSet: BallSet;

  @IsInt()
  @Min(2)
  @Max(20)
  maxPlayers: number;

  @IsNumber()
  @Min(0.01)
  cardPrice: number;
}
```

### 11.2 SQL Injection Prevention

```typescript
// ✅ ใช้ Prisma (Safe by default)
await this.prisma.user.findUnique({
  where: { id: userId }, // Parameterized Query
});

// ❌ อย่าใช้ Raw SQL โดยตรง
await this.prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
```

### 11.3 XSS Prevention

```typescript
// ✅ Sanitize Input
import { sanitize } from 'class-sanitizer';

export class SendMessageDto {
  @IsString()
  @Transform(({ value }) => sanitize(value))
  content: string;
}
```

### 11.4 CSRF Protection

```typescript
// CORS Configuration
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## 12. Performance Optimization

### 12.1 Database Indexes

```sql
-- เพิ่ม Indexes สำคัญ
CREATE INDEX idx_transactions_user_status_created
  ON transactions(user_id, status, created_at DESC);

CREATE INDEX idx_games_room_state_created
  ON games(room_id, state, created_at DESC);

CREATE INDEX idx_cards_user_game
  ON cards(user_id, game_id);
```

### 12.2 Redis Caching

```typescript
@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async findAll() {
    // ตรวจสอบ Cache ก่อน
    const cached = await this.redis.get('rooms:all');
    if (cached) {
      return JSON.parse(cached);
    }

    // Query Database
    const rooms = await this.prisma.room.findMany();

    // บันทึก Cache (TTL 1 minute)
    await this.redis.setex('rooms:all', 60, JSON.stringify(rooms));

    return rooms;
  }
}
```

### 12.3 Query Optimization

```typescript
// ❌ N+1 Problem
const users = await this.prisma.user.findMany();
for (const user of users) {
  const stats = await this.prisma.transaction.count({ where: { userId: user.id } });
}

// ✅ Optimized
const users = await this.prisma.user.findMany({
  include: {
    _count: {
      select: { transactions: true },
    },
  },
});
```

---

## 13. Deployment Guide

### 13.1 การติดตั้ง Dependencies

```bash
# เข้าโฟลเดอร์ Backend
cd bingo-backend

# ติดตั้ง Dependencies
npm install

# สร้าง Prisma Client
npm run prisma:generate

# รัน Database Migration
npm run prisma:migrate
```

### 13.2 การตั้งค่า Environment Variables

```bash
# คัดลอก .env.example
cp .env.example .env

# แก้ไขค่า
nano .env
```

### 13.3 การรัน Development

```bash
# Development Mode (Watch Mode)
npm run start:dev

# Production Mode
npm run build
npm run start:prod
```

### 13.4 การทดสอบ

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Test Coverage
npm run test:cov
```

### 13.5 Swagger API Documentation

เมื่อรัน Server แล้ว สามารถเข้าดู API Docs ได้ที่:
```
http://localhost:8001/api
```

---

## 📊 สรุป

### ✅ ฟีเจอร์ที่สำเร็จแล้ว

1. ✅ **Authentication** - Google OAuth + JWT
2. ✅ **User Management** - Profile, Statistics, Leaderboard
3. ✅ **Wallet System** - Deposit, Withdraw, Transactions (ACID)
4. ✅ **Room Management** - Create, Join, Configure
5. ✅ **Game Engine** - State Machine, Number Drawing, Card Generation
6. ✅ **Anti-Cheat** - Server-side Validation, Rate Limiting, Audit Trail
7. ✅ **WebSocket** - Real-time Events
8. ✅ **Admin Panel** - Transaction Approval, User Management
9. ✅ **Ghost Bot** - AI Player (พร้อม Constraint Policy)

### 🎯 ขั้นตอนถัดไป

1. **Frontend Developer** → ใช้ API นี้เชื่อมต่อกับ React
2. **QA Engineer** → ทดสอบ Security & Anti-Cheat
3. **DevOps** → Setup Production Environment
4. **Database Administrator** → Monitor Performance & Optimize Queries

---

**เอกสารนี้จัดทำโดย**: เม (Backend Developer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: Ready for Implementation ✅

---

## 📞 คำสั่งการใช้งาน

```bash
# ติดตั้ง Dependencies
npm install

# สร้าง Prisma Client
npm run prisma:generate

# รัน Database Migration
npm run prisma:migrate

# รัน Development Server
npm run start:dev

# API Docs
http://localhost:8001/api
```

**หมายเหตุ**: อย่าลืมตั้งค่า `.env` ก่อนรัน Server ค่ะ! 🔧
