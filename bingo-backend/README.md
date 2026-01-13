# 🎯 Bingo Party Enterprise - Backend API

**Backend Developer**: เม 💕
**Tech Stack**: NestJS + TypeScript + Prisma + PostgreSQL + Redis + Socket.io
**Version**: 1.0.0

---

## 📋 สารบัญ

- [เกี่ยวกับโปรเจค](#เกี่ยวกับโปรเจค)
- [Tech Stack](#tech-stack)
- [การติดตั้ง](#การติดตั้ง)
- [การตั้งค่า Environment](#การตั้งค่า-environment)
- [การรัน Development](#การรัน-development)
- [API Documentation](#api-documentation)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [การทดสอบ](#การทดสอบ)
- [Security](#security)
- [Performance](#performance)

---

## เกี่ยวกับโปรเจค

Bingo Party Enterprise คือเว็บแอปเกมบิงโกออนไลน์แบบ Real-time ที่สามารถ **หาเงินได้จริง** ผ่านระบบ Point (1 Point = 1 บาท)

### ✨ ฟีเจอร์หลัก

- ✅ Google OAuth Authentication
- ✅ Wallet System (Deposit/Withdraw)
- ✅ Real-time Bingo Game (WebSocket)
- ✅ Server-side Game Engine
- ✅ Anti-Cheat System
- ✅ Transaction Safety (ACID)
- ✅ Admin Dashboard
- ✅ Ghost Bot (AI Player)

---

## Tech Stack

### Backend

- **Framework**: NestJS v10.3
- **Language**: TypeScript v5.3
- **ORM**: Prisma v5.8
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **WebSocket**: Socket.io v4.6
- **Queue**: Bull
- **Validation**: class-validator
- **Auth**: Passport.js (Google OAuth + JWT)
- **Documentation**: Swagger (OpenAPI)

### Development

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **TypeScript**: 5.3.3

---

## การติดตั้ง

### 1. Clone Repository

```bash
cd bingo-backend
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ติดตั้ง PostgreSQL & Redis

```bash
# macOS (Homebrew)
brew install postgresql@16
brew install redis

# เริ่ม Services
brew services start postgresql@16
brew services start redis
```

### 4. สร้าง Database

```bash
createdb bingo_party
```

### 5. ตั้งค่า Environment Variables

```bash
cp .env.example .env
nano .env
```

แก้ไขค่าใน `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bingo_party"
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-super-secret-key
```

### 6. รัน Database Migration

```bash
npm run prisma:generate
npm run prisma:migrate
```

---

## การตั้งค่า Environment

### Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```env
# Application
NODE_ENV=development
PORT=8001
WEBSOCKET_PORT=8002

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/bingo_party"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8001/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## การรัน Development

### 1. Development Mode (Watch Mode)

```bash
npm run start:dev
```

Server จะรันที่:
- **REST API**: http://localhost:8001
- **WebSocket**: ws://localhost:8002
- **Swagger Docs**: http://localhost:8001/api

### 2. Production Mode

```bash
npm run build
npm run start:prod
```

### 3. Debug Mode

```bash
npm run start:debug
```

---

## API Documentation

### Swagger UI

เข้าดู API Docs ที่:

```
http://localhost:8001/api
```

### API Endpoints

#### Authentication

```
GET  /auth/google                   # Google OAuth Login
GET  /auth/google/callback          # Google OAuth Callback
POST /auth/refresh                  # Refresh Access Token
POST /auth/logout                   # Logout
GET  /auth/me                       # Get Current User
```

#### Users

```
GET  /users/me                      # ดูข้อมูลผู้ใช้
PUT  /users/me                      # อัปเดตข้อมูล
GET  /users/me/statistics           # ดูสถิติการเล่น
GET  /users/leaderboard             # Leaderboard
```

#### Wallet

```
GET  /wallet/balance                # ดูยอดเงิน
GET  /wallet/transactions           # ประวัติธุรกรรม
POST /wallet/deposit                # ขอเติมเงิน
POST /wallet/withdraw               # ขอถอนเงิน
GET  /wallet/pending                # รายการรออนุมัติ
POST /wallet/cancel/:id             # ยกเลิกคำขอ
GET  /wallet/summary                # สรุปการเงิน
```

#### Rooms

```
GET    /rooms                       # ดูรายการห้อง
GET    /rooms/:id                   # ดูห้อง
POST   /rooms                       # สร้างห้อง
PUT    /rooms/:id                   # แก้ไขห้อง
DELETE /rooms/:id                   # ปิดห้อง
```

#### Game

```
POST /game/:roomId/join             # เข้าร่วมห้อง
POST /game/:gameId/buy-cards        # ซื้อการ์ด
POST /game/:gameId/bingo            # กด Bingo
GET  /game/:gameId                  # ดูสถานะเกม
GET  /game/:gameId/cards            # ดูการ์ดของตัวเอง
```

#### Admin (Admin Only)

```
GET  /admin/transactions/pending    # ดูรายการรออนุมัติ
POST /admin/transactions/:id/approve # อนุมัติธุรกรรม
POST /admin/transactions/:id/reject  # ปฏิเสธธุรกรรม
GET  /admin/reports/financial       # รายงานการเงิน
GET  /admin/users                   # ดูรายชื่อผู้ใช้
POST /admin/users/:id/ban           # แบนผู้ใช้
POST /admin/users/:id/unban         # ปลดแบน
GET  /admin/bots                    # ดูรายการ Bot
POST /admin/bots                    # สร้าง Bot
```

---

## โครงสร้างโปรเจค

```
bingo-backend/
├── prisma/
│   ├── schema.prisma          # Database Schema
│   └── migrations/            # Database Migrations
│
├── src/
│   ├── main.ts                # Entry Point
│   ├── app.module.ts          # Root Module
│   ├── prisma/                # Database Module
│   ├── auth/                  # Authentication
│   ├── users/                 # User Management
│   ├── wallet/                # Wallet & Transactions
│   ├── rooms/                 # Room Management
│   ├── game/                  # Game Engine
│   ├── websocket/             # Real-time Events
│   ├── admin/                 # Admin Panel
│   ├── bot/                   # Ghost Bot
│   └── common/                # Utilities
│
├── .env.example               # Environment Template
├── package.json
├── tsconfig.json
└── README.md
```

---

## การทดสอบ

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

---

## Security

### ✅ Security Features

1. **Authentication**: Google OAuth + JWT
2. **Authorization**: Role-based Access Control (RBAC)
3. **Rate Limiting**: Throttle API requests
4. **Input Validation**: class-validator
5. **SQL Injection Prevention**: Prisma ORM
6. **XSS Prevention**: Input Sanitization
7. **CSRF Protection**: CORS Configuration
8. **Anti-Cheat**: Server-side Validation

### 🔒 Best Practices

```typescript
// ✅ Always validate input
export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

// ✅ Use Prisma (Safe by default)
await this.prisma.user.findUnique({ where: { id } });

// ✅ Protect routes with Guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async adminOnly() { }
```

---

## Performance

### Database Optimization

```sql
-- Indexes
CREATE INDEX idx_transactions_user_status_created
  ON transactions(user_id, status, created_at DESC);

CREATE INDEX idx_games_room_state_created
  ON games(room_id, state, created_at DESC);
```

### Redis Caching

```typescript
// Cache Rooms List
const cached = await this.redis.get('rooms:all');
if (cached) return JSON.parse(cached);

// Query & Cache
const rooms = await this.prisma.room.findMany();
await this.redis.setex('rooms:all', 60, JSON.stringify(rooms));
```

---

## 📊 Database Schema

### ERD Diagram

```
users
  ↓
transactions (wallet)
  ↓
rooms
  ↓
games
  ↓
cards → bingo_requests (anti-cheat)
```

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run Migration
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Deploy Migration (Production)
npm run prisma:deploy
```

---

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Run Production Server

```bash
npm run start:prod
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=8001
DATABASE_URL=postgresql://...
REDIS_HOST=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://your-frontend.com
```

---

## 📝 Scripts

```bash
# Development
npm run start:dev          # Watch mode
npm run start:debug        # Debug mode

# Production
npm run build              # Build
npm run start:prod         # Run production

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage

# Database
npm run prisma:generate    # Generate Client
npm run prisma:migrate     # Run migration
npm run prisma:studio      # Open GUI
npm run prisma:deploy      # Deploy migration

# Code Quality
npm run lint               # Lint
npm run format             # Format
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# ตรวจสอบ Port
lsof -i :8001

# Kill Process
kill -9 <PID>
```

### Database Connection Error

```bash
# ตรวจสอบ PostgreSQL
brew services list

# Restart PostgreSQL
brew services restart postgresql@16
```

### Redis Connection Error

```bash
# ตรวจสอบ Redis
brew services list

# Restart Redis
brew services restart redis
```

---

## 📚 เอกสารเพิ่มเติม

- [Backend Design Document](/Users/masterjob/Claude Code Project/backend-design.md)
- [Database Schema](/Users/masterjob/Claude Code Project/database-schema.md)
- [Architecture Design](/Users/masterjob/Claude Code Project/architecture-design.md)
- [Product Roadmap](/Users/masterjob/Claude Code Project/pm-roadmap.md)
- [System Spec](/Users/masterjob/Claude Code Project/bingo-party-enterprise-spec.md)

---

## 👥 ทีมพัฒนา

- **Product Manager**: เม
- **System Architect**: เม
- **Backend Developer**: เม
- **Database Administrator**: เม
- **DevOps Engineer**: เม

---

## 📞 Support

หากมีปัญหาหรือคำถาม:

1. อ่านเอกสาร: `/Users/masterjob/Claude Code Project/backend-design.md`
2. ดู Swagger Docs: `http://localhost:8001/api`
3. ติดต่อทีมพัฒนา

---

**สร้างด้วย ❤️ โดย เม (Backend Developer)**

**วันที่**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0.0
**สถานะ**: Ready for Development ✅
