# 🏗️ Bingo Party Enterprise – Architecture Design

**System Architect**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**สถานะ**: Design Phase

---

## 📑 Table of Contents

1. [System Overview](#1-system-overview)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Tech Stack Selection](#3-tech-stack-selection)
4. [Database Design](#4-database-design)
5. [API Structure](#5-api-structure)
6. [WebSocket Events Design](#6-websocket-events-design)
7. [Security Architecture](#7-security-architecture)
8. [Anti-Cheat Architecture](#8-anti-cheat-architecture)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Port Configuration (macOS)](#10-port-configuration-macos)
11. [Performance Requirements](#11-performance-requirements)
12. [Scalability Strategy](#12-scalability-strategy)

---

## 1. System Overview

### 1.1 สถาปัตยกรรมหลัก

Bingo Party Enterprise ใช้สถาปัตยกรรมแบบ **3-Tier Architecture** พร้อม Real-time Layer:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Tier 1)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web Client  │  │ Admin Panel  │  │  Mobile App  │      │
│  │   (React)    │  │   (React)    │  │  (Phase 3)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          ↕ (HTTPS/WSS)
┌─────────────────────────────────────────────────────────────┐
│                Application Layer (Tier 2)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           API Gateway (Express/NestJS)               │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │  Auth  │  │ Wallet │  │  Game  │  │ Admin  │    │   │
│  │  │Service │  │Service │  │Engine  │  │Service │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Real-time Layer (Socket.io / ws)               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Game     │  │   Chat     │  │  Notif.    │    │   │
│  │  │  Events    │  │  Handler   │  │  Handler   │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Background Workers                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Ghost    │  │  Audit     │  │  Report    │    │   │
│  │  │    Bot     │  │   Logger   │  │ Generator  │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Tier 3)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │     Redis    │  │    S3/Minio  │     │
│  │  (Primary)   │  │   (Cache +   │  │  (File Store)│     │
│  │              │  │   Pub/Sub)   │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Core Design Principles

1. **Server as Single Source of Truth**
   - Client ไม่มีสิทธิ์ตัดสินผลเกม
   - ทุก Action ต้องผ่าน Server Validation

2. **Transaction Safety**
   - ใช้ Database Transaction (ACID)
   - Idempotent Operations
   - Audit Trail ทุก Transaction

3. **Real-time First**
   - WebSocket เป็นหลัก
   - Fallback เป็น HTTP Polling
   - Sub-second Latency Target

4. **Security by Design**
   - Defense in Depth
   - Zero Trust Model
   - Encryption Everywhere

5. **Scalability Ready**
   - Stateless Services
   - Horizontal Scaling
   - Cache-First Architecture

---

## 2. System Architecture Diagram

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Internet Layer                              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Cloudflare CDN (DDoS Protection + SSL Termination)          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Load Balancer Layer                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Nginx / HAProxy (Round Robin + Health Check)               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
        ┌───────────────────┐         ┌───────────────────┐
        │  HTTP API Server  │         │  WebSocket Server │
        │   (Port 8001)     │         │   (Port 8002)     │
        │                   │         │                   │
        │  ┌─────────────┐  │         │  ┌─────────────┐  │
        │  │   Auth      │  │         │  │  Game State │  │
        │  │   Wallet    │  │         │  │  Chat       │  │
        │  │   Admin     │  │         │  │  Notify     │  │
        │  └─────────────┘  │         │  └─────────────┘  │
        └───────────────────┘         └───────────────────┘
                    ↓                           ↓
        ┌───────────────────────────────────────────────┐
        │           Redis Pub/Sub (Port 6379)           │
        │  (Game State Sync + Session Store)            │
        └───────────────────────────────────────────────┘
                               ↓
        ┌───────────────────────────────────────────────┐
        │      PostgreSQL (Port 5432)                   │
        │  ┌─────────────────────────────────────────┐  │
        │  │  users | wallets | transactions         │  │
        │  │  rooms | games | cards | audit_logs     │  │
        │  └─────────────────────────────────────────┘  │
        └───────────────────────────────────────────────┘
                               ↓
        ┌───────────────────────────────────────────────┐
        │      Background Workers (Bull Queue)          │
        │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
        │  │ Bot AI  │  │ Auditor │  │ Reporter│      │
        │  └─────────┘  └─────────┘  └─────────┘      │
        └───────────────────────────────────────────────┘
```

### 2.2 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    User Action Flow                          │
└──────────────────────────────────────────────────────────────┘

1. Buy Card Flow:
   Client → API Gateway → Auth Middleware → Wallet Service
   → [Lock Points] → Game Service → [Issue Card]
   → Database Transaction → Success Response
   → WebSocket Broadcast → All Clients Update

2. Bingo Validation Flow:
   Client → WebSocket → Rate Limiter → Game Engine
   → [Validate Pattern] → [Check Timestamp] → [Verify Card]
   → Database Transaction → Payout Service → Winner Declared
   → Audit Log → WebSocket Broadcast

3. Financial Transaction Flow:
   Client → API Gateway → Auth → Wallet Service
   → [Create Transaction Record] → [Status: Pending]
   → Admin Notification → Admin Approval
   → [Update Balance] → [Status: Completed] → Audit Log
```

---

## 3. Tech Stack Selection

### 3.1 Backend Stack

#### **Framework: NestJS (Node.js + TypeScript)**
**เหตุผลที่เลือก:**
- ✅ TypeScript Native (Type Safety)
- ✅ Built-in Dependency Injection
- ✅ Modular Architecture (Service-Based)
- ✅ WebSocket Support (Socket.io Integration)
- ✅ Strong Community + Documentation
- ✅ Enterprise-Grade Structure
- ✅ Testing Framework Built-in (Jest)

**ทางเลือก:**
- Express.js (เบากว่า แต่ต้อง Setup เอง)
- Fastify (เร็วกว่า แต่ Ecosystem น้อยกว่า)

#### **Database: PostgreSQL 16**
**เหตุผลที่เลือก:**
- ✅ ACID Compliance (สำคัญสำหรับการเงิน!)
- ✅ Transaction Support
- ✅ JSON/JSONB Support (Flexible Schema)
- ✅ Row-Level Locking
- ✅ Full-Text Search
- ✅ Proven Reliability
- ✅ macOS Friendly (ผ่าน Homebrew)

**Schema:**
```sql
-- ใช้ ACID Transaction สำหรับ
-- 1. Wallet Operations
-- 2. Game State Changes
-- 3. Payout Distribution
```

#### **Cache & Session: Redis 7**
**เหตุผลที่เลือก:**
- ✅ In-Memory Speed
- ✅ Pub/Sub (สำหรับ Multi-Server)
- ✅ Session Store
- ✅ Rate Limiting
- ✅ Game State Cache
- ✅ Leaderboard (Sorted Sets)

**ใช้งาน:**
```
1. Session Store (JWT Refresh Tokens)
2. Game Room State (TTL-based)
3. Rate Limiting (Per User/Per Action)
4. Pub/Sub (WebSocket Sync)
5. Leaderboard Cache
```

#### **Real-time: Socket.io**
**เหตุผลที่เลือก:**
- ✅ Auto-Reconnect
- ✅ Room Support (สำหรับ Game Rooms)
- ✅ Event-Based
- ✅ Fallback เป็น Polling
- ✅ Binary Support
- ✅ Integration กับ NestJS ง่าย

**ทางเลือก:**
- ws (เบากว่า แต่ต้อง Handle เอง)
- SocketCluster (Scale ได้ดี แต่ Complex)

#### **Queue System: BullMQ**
**เหตุผลที่เลือก:**
- ✅ Redis-based
- ✅ Priority Queue
- ✅ Delayed Jobs
- ✅ Retry Mechanism
- ✅ UI Dashboard

**ใช้งาน:**
```
1. Ghost Bot Actions (ซื้อการ์ด, กด Bingo)
2. Report Generation
3. Audit Log Processing
4. Email Notifications
```

#### **Authentication: Passport.js (Google OAuth)**
**เหตุผลที่เลือก:**
- ✅ Google Strategy Built-in
- ✅ JWT Support
- ✅ Session Management
- ✅ Integration กับ NestJS

**Flow:**
```
1. Google OAuth Login
2. JWT Access Token (15 min)
3. JWT Refresh Token (7 days) → Store in Redis
4. Role-Based Access Control (RBAC)
```

### 3.2 Frontend Stack

#### **Framework: React 18 + TypeScript**
**เหตุผลที่เลือก:**
- ✅ Virtual DOM (Performance)
- ✅ Large Ecosystem
- ✅ TypeScript Support
- ✅ React 18 Concurrent Features

#### **State Management: Zustand**
**เหตุผลที่เลือก:**
- ✅ Simple API (เรียนรู้ง่าย)
- ✅ No Boilerplate
- ✅ TypeScript Native
- ✅ DevTools Support
- ✅ Performance (Subscription-based)

**Store Structure:**
```typescript
// stores/
//   - authStore.ts (User, Token)
//   - gameStore.ts (Room State, Cards)
//   - walletStore.ts (Balance, Transactions)
//   - uiStore.ts (Modals, Toasts)
```

#### **UI Library: Ant Design (antd)**
**เหตุผลที่เลือก:**
- ✅ Enterprise-Grade Components
- ✅ TypeScript Support
- ✅ Theme Customization
- ✅ Form Handling
- ✅ Table/Grid Components (Admin Dashboard)

**ทางเลือก:**
- Material-UI (ดีเหมือนกัน)
- Chakra UI (Modern แต่ Component น้อยกว่า)

#### **WebSocket Client: Socket.io-client**
**เหตุผลที่เลือก:**
- ✅ Pair กับ Backend Socket.io
- ✅ Auto-Reconnect
- ✅ Event Handling
- ✅ TypeScript Support

#### **Build Tool: Vite**
**เหตุผลที่เลือก:**
- ✅ Fast HMR (Hot Module Reload)
- ✅ TypeScript Native
- ✅ Modern Build (ESM)
- ✅ Tree Shaking

### 3.3 DevOps & Infrastructure

#### **Containerization: Docker**
**เหตุผลที่เลือก:**
- ✅ Consistency (Dev = Prod)
- ✅ Isolation
- ✅ Easy Deployment

**Services:**
```yaml
# docker-compose.yml
services:
  api-server:    # Port 8001
  ws-server:     # Port 8002
  postgres:      # Port 5432
  redis:         # Port 6379
  nginx:         # Port 3001 (Frontend)
```

#### **Hosting: Railway / DigitalOcean**
**เหตุผลที่เลือก (Railway):**
- ✅ Free Tier (MVP)
- ✅ Auto Deploy (Git Push)
- ✅ PostgreSQL + Redis Built-in
- ✅ Environment Variables

**เหตุผลที่เลือก (DigitalOcean):**
- ✅ Affordable ($10-20/month MVP)
- ✅ Full Control (Droplet)
- ✅ Managed Database
- ✅ Object Storage (S3-like)

**Phase Plan:**
```
MVP → Railway (Free)
Phase 1-2 → DigitalOcean ($20/month)
Phase 3 → AWS/GCP (Auto-scaling)
```

#### **Monitoring: Sentry + LogRocket**
**Sentry (Error Tracking):**
- ✅ Real-time Error Alerts
- ✅ Stack Trace
- ✅ User Context

**LogRocket (Session Replay):**
- ✅ Bug Reproduction
- ✅ User Journey
- ✅ Performance Metrics

#### **CI/CD: GitHub Actions**
**Pipeline:**
```yaml
1. Push → main branch
2. Run Tests (Jest + Playwright)
3. Build Docker Image
4. Deploy to Staging
5. Run E2E Tests
6. Deploy to Production (Manual Approval)
```

### 3.4 Security Tools

- **Helmet.js**: HTTP Security Headers
- **Rate Limiter**: express-rate-limit + Redis
- **Sanitizer**: DOMPurify (XSS Prevention)
- **Validator**: class-validator (Input Validation)
- **Encryption**: bcrypt (Passwords), crypto (Secrets)

---

## 4. Database Design

### 4.1 Database Schema Overview

```sql
-- ==========================================
-- Schema: bingo_party
-- Database: PostgreSQL 16
-- ==========================================

-- Enums
CREATE TYPE user_role AS ENUM ('player', 'admin', 'bot');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdraw', 'card_purchase', 'payout', 'refund', 'fee');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'rejected', 'cancelled');
CREATE TYPE game_state AS ENUM ('idle', 'waiting', 'sitting', 'buying', 'running', 'bingo_race', 'winner_declared', 'payout', 'cooldown');
CREATE TYPE draw_mode AS ENUM ('auto', 'manual_rotate');
CREATE TYPE ball_set AS ENUM ('75', '90');

-- ==========================================
-- 1. Users & Authentication
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'player',

  -- Wallet
  point_balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (point_balance >= 0),

  -- Bank Info (for withdrawal)
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_account_name VARCHAR(100),

  -- Statistics
  total_games_played INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0.00,
  total_won DECIMAL(12, 2) DEFAULT 0.00,

  -- Security
  is_banned BOOLEAN DEFAULT false,
  banned_reason TEXT,
  banned_until TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- 2. Sessions (Optional - ใช้ Redis ก็ได้)
-- ==========================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);

-- ==========================================
-- 3. Transactions (Financial Audit Trail)
-- ==========================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  status transaction_status DEFAULT 'pending',

  -- Balance Snapshot
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,

  -- Payment Info (for deposit/withdraw)
  payment_slip_url TEXT,
  bank_transfer_id VARCHAR(100),

  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  -- Metadata
  metadata JSONB, -- { game_id, card_id, etc. }
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ==========================================
-- 4. Rooms
-- ==========================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,

  -- Configuration
  creator_id UUID REFERENCES users(id),
  draw_mode draw_mode DEFAULT 'auto',
  ball_set ball_set DEFAULT '75',
  max_players INT DEFAULT 10 CHECK (max_players BETWEEN 2 AND 20),
  max_rounds INT DEFAULT 50 CHECK (max_rounds > 0),
  card_price DECIMAL(10, 2) NOT NULL CHECK (card_price > 0),
  max_cards_per_player INT DEFAULT 4 CHECK (max_cards_per_player BETWEEN 1 AND 10),

  -- Fee Configuration
  fee_percentage DECIMAL(5, 2) DEFAULT 10.00 CHECK (fee_percentage BETWEEN 0 AND 100),

  -- Statistics
  current_round INT DEFAULT 0,
  total_rounds_played INT DEFAULT 0,
  total_pot_collected DECIMAL(12, 2) DEFAULT 0.00,
  total_fee_collected DECIMAL(12, 2) DEFAULT 0.00,

  -- Top Winner
  top_winner_id UUID REFERENCES users(id),
  top_winner_amount DECIMAL(12, 2) DEFAULT 0.00,

  -- State
  current_state game_state DEFAULT 'idle',
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_is_active ON rooms(is_active);
CREATE INDEX idx_rooms_current_state ON rooms(current_state);

-- ==========================================
-- 5. Games (รอบเกม)
-- ==========================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,

  round_number INT NOT NULL,

  -- Game State
  state game_state DEFAULT 'waiting',

  -- Numbers
  drawn_numbers INT[], -- [1, 45, 23, ...]
  current_ball INT,
  total_balls_drawn INT DEFAULT 0,

  -- Financial
  pot_size DECIMAL(12, 2) DEFAULT 0.00,
  fee_amount DECIMAL(12, 2) DEFAULT 0.00,
  payout_amount DECIMAL(12, 2) DEFAULT 0.00,

  -- Winner
  winner_id UUID REFERENCES users(id),
  winner_card_id UUID,
  winning_pattern VARCHAR(50), -- 'horizontal_1', 'full_card', etc.
  balls_to_win INT,

  -- Timestamps
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_games_room_id ON games(room_id);
CREATE INDEX idx_games_state ON games(state);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- ==========================================
-- 6. Game Participants
-- ==========================================
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

  is_spectator BOOLEAN DEFAULT false,
  cards_bought INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,

  joined_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_user_id ON game_participants(user_id);

-- ==========================================
-- 7. Bingo Cards
-- ==========================================
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

  -- Card Data
  numbers INT[][] NOT NULL, -- [[1,2,3],[4,5,6],...] (5x5 grid)
  card_hash VARCHAR(64) NOT NULL, -- SHA256 hash สำหรับ verify

  -- State
  marked_positions JSONB DEFAULT '[]', -- [{row: 0, col: 1}, ...]
  is_winner BOOLEAN DEFAULT false,

  -- Purchase
  purchase_price DECIMAL(10, 2) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cards_game_id ON cards(game_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_card_hash ON cards(card_hash);

-- ==========================================
-- 8. Bingo Requests (Anti-Cheat Audit)
-- ==========================================
CREATE TABLE bingo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,

  -- Validation
  claimed_pattern VARCHAR(50) NOT NULL,
  is_valid BOOLEAN NOT NULL,
  validation_result JSONB, -- { reason: 'invalid_pattern', details: {...} }

  -- Timing (Anti-Cheat)
  balls_when_requested INT, -- จำนวนลูกตอนกด Bingo
  request_latency_ms INT, -- Time from ball drawn to bingo request

  -- Result
  is_winner BOOLEAN DEFAULT false,
  winner_rank INT, -- 1 = first, 2 = second (ถ้ามีคนกดพร้อมกัน)

  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  server_timestamp TIMESTAMP DEFAULT NOW() -- Server Time (Authority)
);

CREATE INDEX idx_bingo_requests_game_id ON bingo_requests(game_id);
CREATE INDEX idx_bingo_requests_user_id ON bingo_requests(user_id);
CREATE INDEX idx_bingo_requests_server_timestamp ON bingo_requests(server_timestamp);

-- ==========================================
-- 9. Audit Logs (Security & Compliance)
-- ==========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Actor
  user_id UUID REFERENCES users(id),
  user_role user_role,

  -- Action
  action VARCHAR(100) NOT NULL, -- 'login', 'buy_card', 'withdraw', etc.
  entity_type VARCHAR(50), -- 'user', 'transaction', 'game', etc.
  entity_id UUID,

  -- Details
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==========================================
-- 10. Bot Configurations (Ghost Bot)
-- ==========================================
CREATE TABLE bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Constraints
  max_cards_per_game INT DEFAULT 2,
  max_win_rate_percent DECIMAL(5, 2) DEFAULT 30.00, -- ห้ามชนะเกิน 30%
  max_consecutive_wins INT DEFAULT 2, -- ห้ามชนะติดกันเกิน 2 รอบ

  -- Delays (Anti-Detection)
  min_delay_ms INT DEFAULT 500,
  max_delay_ms INT DEFAULT 2000,

  -- Budget
  daily_budget DECIMAL(10, 2) DEFAULT 1000.00,
  current_daily_spent DECIMAL(10, 2) DEFAULT 0.00,

  -- Statistics
  total_games_played INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,

  -- State
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bot_configs_bot_user_id ON bot_configs(bot_user_id);
CREATE INDEX idx_bot_configs_is_active ON bot_configs(is_active);

-- ==========================================
-- 11. Chat Messages
-- ==========================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'sticker', 'system'
  content TEXT NOT NULL,
  metadata JSONB, -- { sticker_id: 'happy_bingo' }

  is_deleted BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ==========================================
-- 12. System Settings (Admin)
-- ==========================================
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default Settings
INSERT INTO system_settings (key, value, description) VALUES
  ('default_fee_percentage', '10.00', 'Default room fee percentage'),
  ('max_withdraw_per_day', '50000.00', 'Maximum withdrawal per day per user'),
  ('min_withdraw_amount', '100.00', 'Minimum withdrawal amount'),
  ('rate_limit_bingo_per_minute', '10', 'Max bingo requests per minute per user'),
  ('maintenance_mode', 'false', 'Enable maintenance mode');
```

### 4.2 Key Indexes & Performance

```sql
-- ==========================================
-- Performance Optimization
-- ==========================================

-- Composite Indexes
CREATE INDEX idx_transactions_user_status_created
  ON transactions(user_id, status, created_at DESC);

CREATE INDEX idx_games_room_state_created
  ON games(room_id, state, created_at DESC);

-- Partial Indexes (สำหรับ Query ที่ Query บ่อย)
CREATE INDEX idx_transactions_pending
  ON transactions(created_at DESC)
  WHERE status = 'pending';

CREATE INDEX idx_users_active_players
  ON users(created_at DESC)
  WHERE role = 'player' AND is_banned = false;

-- Full-Text Search (สำหรับ Search ห้อง)
CREATE INDEX idx_rooms_name_fulltext
  ON rooms USING gin(to_tsvector('english', name));
```

### 4.3 Critical Constraints

```sql
-- ==========================================
-- Business Rule Constraints
-- ==========================================

-- ห้ามลบ User ถ้ามี Transaction ค้างอยู่
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE RESTRICT;

-- Point Balance ต้องไม่ติดลบ
ALTER TABLE users
  ADD CONSTRAINT check_point_balance_non_negative
  CHECK (point_balance >= 0);

-- Transaction Amount ต้องมากกว่า 0
ALTER TABLE transactions
  ADD CONSTRAINT check_transaction_amount_positive
  CHECK (amount > 0);

-- Fee Percentage 0-100%
ALTER TABLE rooms
  ADD CONSTRAINT check_fee_percentage_range
  CHECK (fee_percentage BETWEEN 0 AND 100);
```

---

## 5. API Structure

### 5.1 REST API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                      API Structure                          │
│                  Base URL: /api/v1                          │
└─────────────────────────────────────────────────────────────┘

🔐 Authentication & Users
├─ POST   /auth/google                    # Google OAuth Login
├─ POST   /auth/refresh                   # Refresh Access Token
├─ POST   /auth/logout                    # Logout
├─ GET    /users/me                       # Get Current User Profile
├─ PATCH  /users/me                       # Update Profile
└─ PATCH  /users/me/bank-info             # Update Bank Info

💰 Wallet & Transactions
├─ GET    /wallet/balance                 # Get Current Balance
├─ GET    /wallet/transactions            # Get Transaction History
│         Query: ?type=deposit&status=pending&page=1&limit=20
├─ POST   /wallet/deposit                 # Request Deposit
│         Body: { amount, payment_slip_url }
└─ POST   /wallet/withdraw                # Request Withdrawal
          Body: { amount, bank_info }

🎮 Rooms & Lobby
├─ GET    /rooms                          # List All Rooms
│         Query: ?is_active=true&state=waiting&page=1
├─ GET    /rooms/:roomId                  # Get Room Details
├─ POST   /rooms                          # Create New Room (Admin/User)
│         Body: { name, draw_mode, ball_set, card_price, ... }
├─ PATCH  /rooms/:roomId                  # Update Room Config (Creator)
└─ DELETE /rooms/:roomId                  # Delete Room (Creator/Admin)

🎲 Game Actions
├─ POST   /rooms/:roomId/join             # Join Room (as Player)
├─ POST   /rooms/:roomId/leave            # Leave Room
├─ POST   /rooms/:roomId/sit              # Sit in Game (Sitting Phase)
├─ POST   /rooms/:roomId/buy-cards        # Buy Bingo Cards
│         Body: { quantity: 1-4 }
├─ POST   /rooms/:roomId/bingo            # Claim Bingo (via WebSocket ดีกว่า)
│         Body: { card_id, pattern }
└─ GET    /rooms/:roomId/cards            # Get My Cards in Current Game

📊 Leaderboard & Stats
├─ GET    /leaderboard                    # Global Leaderboard
│         Query: ?type=wins&period=weekly&limit=10
└─ GET    /users/:userId/stats            # User Statistics

👨‍💼 Admin API
├─ GET    /admin/users                    # List All Users
├─ PATCH  /admin/users/:userId/ban        # Ban User
├─ GET    /admin/transactions/pending     # Pending Approvals
├─ PATCH  /admin/transactions/:id/approve # Approve Deposit/Withdraw
├─ PATCH  /admin/transactions/:id/reject  # Reject Deposit/Withdraw
├─ GET    /admin/reports/financial        # Financial Report
│         Query: ?from=2026-01-01&to=2026-01-31
├─ GET    /admin/reports/users            # User Risk Report
├─ GET    /admin/bots                     # List Ghost Bots
├─ POST   /admin/bots                     # Create Ghost Bot
└─ PATCH  /admin/bots/:botId              # Update Bot Config

🔍 Health & Monitoring
├─ GET    /health                         # Health Check
└─ GET    /metrics                        # Prometheus Metrics (Production)
```

### 5.2 API Request/Response Examples

#### 5.2.1 Authentication

```typescript
// POST /api/v1/auth/google
Request:
{
  "google_token": "ya29.a0AfH6SMB..."
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "rt_abc123...",
  "expires_in": 900, // 15 minutes
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "role": "player",
    "point_balance": 1500.00
  }
}
```

#### 5.2.2 Buy Cards

```typescript
// POST /api/v1/rooms/:roomId/buy-cards
Request:
{
  "quantity": 2
}

Response:
{
  "success": true,
  "cards": [
    {
      "id": "card_uuid_1",
      "numbers": [[1,16,31,46,61],[2,17,32,47,62],...],
      "card_hash": "abc123...",
      "purchase_price": 100.00
    },
    {
      "id": "card_uuid_2",
      "numbers": [[...]]
    }
  ],
  "total_cost": 200.00,
  "new_balance": 1300.00,
  "transaction_id": "txn_uuid"
}
```

#### 5.2.3 Admin Approve Deposit

```typescript
// PATCH /api/v1/admin/transactions/:id/approve
Request:
{
  "notes": "Verified bank transfer"
}

Response:
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "type": "deposit",
    "amount": 1000.00,
    "status": "completed",
    "user_id": "user_uuid",
    "approved_by": "admin_uuid",
    "approved_at": "2026-01-12T10:30:00Z"
  }
}
```

### 5.3 Error Response Format

```typescript
// Standard Error Response
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "คุณมี Point ไม่เพียงพอ",
    "details": {
      "required": 200.00,
      "available": 150.00
    },
    "timestamp": "2026-01-12T10:00:00Z"
  }
}

// Error Codes:
// - AUTH_INVALID_TOKEN
// - AUTH_EXPIRED_TOKEN
// - USER_NOT_FOUND
// - USER_BANNED
// - INSUFFICIENT_BALANCE
// - ROOM_FULL
// - ROOM_NOT_FOUND
// - GAME_ALREADY_STARTED
// - INVALID_GAME_STATE
// - CARD_LIMIT_EXCEEDED
// - RATE_LIMIT_EXCEEDED
// - INVALID_BINGO_CLAIM
// - VALIDATION_ERROR
// - INTERNAL_SERVER_ERROR
```

### 5.4 Authentication & Authorization

```typescript
// Middleware Flow
Request
  → Rate Limiter (Redis)
  → JWT Validation
  → User Lookup (Cache → DB)
  → Role Check (RBAC)
  → Route Handler

// JWT Payload
{
  "sub": "user_uuid",        // User ID
  "email": "user@example.com",
  "role": "player",
  "iat": 1673512345,         // Issued At
  "exp": 1673513245          // Expires At (15 min)
}

// Protected Routes
/api/v1/wallet/**          → Require: Authenticated
/api/v1/rooms/:id/buy-cards → Require: Authenticated + Not Banned
/api/v1/admin/**           → Require: Admin Role
```

---

## 6. WebSocket Events Design

### 6.1 WebSocket Connection Flow

```typescript
// ==========================================
// Client → Server Connection
// ==========================================

1. Client connects to wss://domain.com:8002
2. Server sends: 'connect_ack'
3. Client authenticates: emit('auth', { access_token })
4. Server validates JWT
5. Server sends: 'auth_success' or 'auth_failed'
6. Client joins room: emit('join_room', { room_id })
7. Server adds client to room namespace
8. Server broadcasts: 'user_joined'

// ==========================================
// Namespaces
// ==========================================

/lobby         → Lobby updates (room list, player counts)
/rooms/:roomId → Game-specific events
/admin         → Admin notifications
```

### 6.2 Event Definitions

```typescript
// ==========================================
// 🏛️ Lobby Events
// ==========================================

// Server → Client
event: 'lobby:room_list'
payload: {
  rooms: [
    {
      id: 'uuid',
      name: 'Room 1',
      state: 'waiting',
      current_players: 5,
      max_players: 10,
      current_round: 3,
      max_rounds: 50,
      pot_size: 1000.00,
      card_price: 100.00,
      top_winner: {
        name: 'Player A',
        amount: 5000.00
      }
    }
  ]
}

event: 'lobby:room_updated'
payload: {
  room_id: 'uuid',
  updates: {
    current_players: 6,
    pot_size: 1200.00,
    state: 'buying'
  }
}

// ==========================================
// 🎮 Game Room Events
// ==========================================

// Client → Server
event: 'game:sit'
payload: { room_id: 'uuid' }

event: 'game:buy_cards'
payload: { room_id: 'uuid', quantity: 2 }

event: 'game:claim_bingo'
payload: {
  room_id: 'uuid',
  card_id: 'uuid',
  pattern: 'horizontal_1'
}

event: 'game:manual_draw' // Manual Draw Mode
payload: { room_id: 'uuid' }

// Server → Client
event: 'game:state_changed'
payload: {
  room_id: 'uuid',
  old_state: 'waiting',
  new_state: 'sitting',
  countdown: 30 // seconds
}

event: 'game:sitting_phase_started'
payload: {
  room_id: 'uuid',
  duration: 30, // seconds
  deadline: '2026-01-12T10:00:30Z'
}

event: 'game:buying_phase_started'
payload: {
  room_id: 'uuid',
  duration: 20,
  card_price: 100.00,
  max_cards: 4
}

event: 'game:player_sat'
payload: {
  room_id: 'uuid',
  user: {
    id: 'uuid',
    display_name: 'Player A',
    avatar_url: '...'
  },
  total_players: 5
}

event: 'game:player_bought_cards'
payload: {
  room_id: 'uuid',
  user_id: 'uuid',
  quantity: 2,
  pot_size: 1200.00
}

event: 'game:started'
payload: {
  room_id: 'uuid',
  game_id: 'uuid',
  round_number: 1,
  pot_size: 1000.00,
  fee_amount: 100.00,
  participants: [
    {
      user_id: 'uuid',
      display_name: 'Player A',
      cards_count: 2
    }
  ]
}

event: 'game:ball_drawn'
payload: {
  room_id: 'uuid',
  game_id: 'uuid',
  ball: 42,
  total_balls: 15,
  drawn_numbers: [1, 5, 12, 23, 42],
  server_timestamp: '2026-01-12T10:05:23.456Z'
}

event: 'game:auto_mark' // Auto-mark matched numbers on cards
payload: {
  room_id: 'uuid',
  card_id: 'uuid',
  matched_positions: [
    { row: 2, col: 3 }
  ]
}

event: 'game:bingo_claimed'
payload: {
  room_id: 'uuid',
  game_id: 'uuid',
  user_id: 'uuid',
  user_name: 'Player A',
  card_id: 'uuid',
  pattern: 'horizontal_1',
  is_valid: true
}

event: 'game:bingo_race'
payload: {
  room_id: 'uuid',
  game_id: 'uuid',
  claims: [
    {
      user_id: 'uuid',
      user_name: 'Player A',
      timestamp: '2026-01-12T10:05:25.100Z',
      rank: 1
    },
    {
      user_id: 'uuid2',
      user_name: 'Player B',
      timestamp: '2026-01-12T10:05:25.350Z',
      rank: 2
    }
  ]
}

event: 'game:winner_declared'
payload: {
  room_id: 'uuid',
  game_id: 'uuid',
  winner: {
    user_id: 'uuid',
    display_name: 'Player A',
    avatar_url: '...',
    card_id: 'uuid',
    pattern: 'full_card',
    balls_to_win: 25,
    payout_amount: 900.00
  },
  pot_size: 1000.00,
  fee_amount: 100.00
}

event: 'game:payout_completed'
payload: {
  room_id: 'uuid',
  game_id: 'uuid',
  winner_id: 'uuid',
  payout_amount: 900.00,
  transaction_id: 'uuid'
}

event: 'game:cooldown_started'
payload: {
  room_id: 'uuid',
  duration: 30,
  next_round: 2
}

event: 'game:error'
payload: {
  room_id: 'uuid',
  code: 'INSUFFICIENT_BALANCE',
  message: 'คุณมี Point ไม่เพียงพอ'
}

// ==========================================
// 💬 Chat Events
// ==========================================

// Client → Server
event: 'chat:send_message'
payload: {
  room_id: 'uuid',
  message: 'สนุกมาก!',
  type: 'text'
}

event: 'chat:send_sticker'
payload: {
  room_id: 'uuid',
  sticker_id: 'happy_bingo'
}

// Server → Client
event: 'chat:new_message'
payload: {
  room_id: 'uuid',
  message_id: 'uuid',
  user: {
    id: 'uuid',
    display_name: 'Player A',
    avatar_url: '...'
  },
  type: 'text',
  content: 'สนุกมาก!',
  timestamp: '2026-01-12T10:00:00Z'
}

event: 'chat:system_message'
payload: {
  room_id: 'uuid',
  type: 'system',
  content: 'Player A ชนะเกม! 🎉',
  timestamp: '2026-01-12T10:00:00Z'
}

// ==========================================
// 👨‍💼 Admin Events
// ==========================================

// Server → Admin Clients
event: 'admin:new_transaction'
payload: {
  transaction_id: 'uuid',
  type: 'deposit',
  user_id: 'uuid',
  user_name: 'Player A',
  amount: 1000.00,
  payment_slip_url: '...'
}

event: 'admin:suspicious_activity'
payload: {
  user_id: 'uuid',
  user_name: 'Player A',
  activity: 'multiple_bingo_fails',
  details: {
    failed_attempts: 10,
    last_5_min: true
  },
  risk_score: 8.5
}

// ==========================================
// 🔔 User Notifications
// ==========================================

event: 'notification:balance_updated'
payload: {
  old_balance: 1000.00,
  new_balance: 1500.00,
  change: 500.00,
  reason: 'Deposit approved'
}

event: 'notification:transaction_approved'
payload: {
  transaction_id: 'uuid',
  type: 'withdraw',
  amount: 500.00,
  status: 'completed'
}

event: 'notification:kicked_from_room'
payload: {
  room_id: 'uuid',
  reason: 'Insufficient balance'
}
```

### 6.3 Event Security & Validation

```typescript
// ==========================================
// Rate Limiting (Redis-based)
// ==========================================

Rate Limits per User:
- 'game:claim_bingo':  10 requests / minute
- 'game:buy_cards':    5 requests / minute
- 'chat:send_message': 10 messages / minute
- 'game:sit':          3 requests / minute

// Exceed Limit → Send Error Event
event: 'error:rate_limit_exceeded'
payload: {
  action: 'game:claim_bingo',
  retry_after: 30 // seconds
}

// ==========================================
// Server-side Validation
// ==========================================

EVERY client event MUST:
1. Validate JWT token
2. Check user role & permissions
3. Validate payload schema (class-validator)
4. Check rate limits
5. Verify game state (e.g., can't buy cards during 'running' state)
6. Log to audit_logs table

// Example Validation Flow
async handleClaimBingo(client, payload) {
  // 1. Validate Token
  const user = await this.validateToken(client.token);
  if (!user) throw new UnauthorizedException();

  // 2. Rate Limit
  const allowed = await this.rateLimiter.check(user.id, 'claim_bingo');
  if (!allowed) throw new RateLimitException();

  // 3. Validate Payload
  const dto = plainToClass(ClaimBingoDto, payload);
  const errors = await validate(dto);
  if (errors.length > 0) throw new ValidationException(errors);

  // 4. Check Game State
  const game = await this.gameService.getGame(payload.room_id);
  if (game.state !== 'running') throw new InvalidGameStateException();

  // 5. Validate Bingo (Server-side)
  const isValid = await this.gameEngine.validateBingo(
    payload.card_id,
    payload.pattern,
    game.drawn_numbers
  );

  // 6. Audit Log
  await this.auditService.log({
    user_id: user.id,
    action: 'claim_bingo',
    entity_type: 'game',
    entity_id: game.id,
    metadata: { card_id: payload.card_id, is_valid: isValid }
  });

  // 7. Process Result
  if (isValid) {
    await this.gameService.processBingoWin(game.id, user.id, payload.card_id);
  }

  return isValid;
}
```

### 6.4 Reconnection & State Recovery

```typescript
// ==========================================
// Auto-Reconnection Strategy
// ==========================================

// Client-side (Socket.io)
const socket = io('wss://domain.com:8002', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

// On Reconnect → Recover State
socket.on('reconnect', async () => {
  // Re-authenticate
  socket.emit('auth', { access_token: getToken() });

  // Rejoin Room
  const currentRoomId = getCurrentRoomId();
  if (currentRoomId) {
    socket.emit('join_room', { room_id: currentRoomId });
  }

  // Request State Sync
  socket.emit('game:request_state', { room_id: currentRoomId });
});

// Server → Client State Sync
event: 'game:state_sync'
payload: {
  room_id: 'uuid',
  game: {
    id: 'uuid',
    state: 'running',
    round_number: 3,
    drawn_numbers: [1, 5, 12, 23, 42, ...],
    pot_size: 1000.00,
    participants: [...]
  },
  my_cards: [
    {
      id: 'uuid',
      numbers: [[...]],
      marked_positions: [...]
    }
  ]
}
```

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│              Security Defense in Depth                  │
└─────────────────────────────────────────────────────────┘

Layer 1: Network Security
├─ Cloudflare DDoS Protection
├─ SSL/TLS Encryption (HTTPS/WSS)
├─ Firewall Rules (Allow Only 80, 443, 8001, 8002)
└─ Rate Limiting (Cloudflare + Application Level)

Layer 2: Application Gateway
├─ Helmet.js (HTTP Security Headers)
├─ CORS Configuration (Whitelist Origins)
├─ Request Size Limit (100KB for JSON)
└─ IP Whitelist for Admin Panel

Layer 3: Authentication & Authorization
├─ Google OAuth (Delegated Authentication)
├─ JWT (Access Token: 15 min, Refresh Token: 7 days)
├─ Role-Based Access Control (RBAC)
├─ Session Management (Redis)
└─ Token Rotation (Refresh Token)

Layer 4: Input Validation
├─ Schema Validation (class-validator)
├─ SQL Injection Prevention (Parameterized Queries)
├─ XSS Prevention (DOMPurify + CSP Headers)
├─ CSRF Protection (SameSite Cookies)
└─ File Upload Validation (Image Type, Size)

Layer 5: Business Logic Security
├─ Server-side Game Validation
├─ Transaction Isolation (Database Locks)
├─ Idempotency Keys (Prevent Duplicate Actions)
└─ Audit Logging (Every Critical Action)

Layer 6: Data Security
├─ Encryption at Rest (Database Encryption)
├─ Encryption in Transit (TLS 1.3)
├─ Sensitive Data Masking (Logs)
├─ Backup Encryption
└─ Password Hashing (bcrypt, rounds=12)

Layer 7: Monitoring & Response
├─ Intrusion Detection (Fail2Ban)
├─ Error Tracking (Sentry)
├─ Security Alerts (Slack/Email)
└─ Incident Response Plan
```

### 7.2 Authentication Flow

```typescript
// ==========================================
// Google OAuth Flow
// ==========================================

1. Client → Redirect to Google OAuth
   GET https://accounts.google.com/o/oauth2/v2/auth
   ?client_id=...
   &redirect_uri=https://yourdomain.com/auth/callback
   &response_type=code
   &scope=email profile

2. User Logs in with Google

3. Google → Redirect to Callback URL
   GET https://yourdomain.com/auth/callback?code=AUTH_CODE

4. Server → Exchange Code for Google Token
   POST https://oauth2.googleapis.com/token
   Body: { code, client_id, client_secret, redirect_uri }

5. Server → Verify Google Token
   GET https://www.googleapis.com/oauth2/v3/userinfo
   Headers: { Authorization: 'Bearer GOOGLE_ACCESS_TOKEN' }

6. Server → Create/Update User
   - Check if user exists (by google_id)
   - If not, create new user
   - Update last_login_at

7. Server → Generate JWT Tokens
   - Access Token (15 min, not stored)
   - Refresh Token (7 days, stored in Redis)

8. Server → Return Tokens to Client
   Response: {
     access_token: 'eyJhbGc...',
     refresh_token: 'rt_abc123...',
     expires_in: 900
   }

9. Client → Store Tokens
   - Access Token: Memory (Zustand Store)
   - Refresh Token: HttpOnly Cookie (Secure, SameSite=Strict)

// ==========================================
// JWT Structure
// ==========================================

Access Token (HS256):
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "player",
  "iat": 1673512345,
  "exp": 1673513245 // 15 min
}

Refresh Token (Stored in Redis):
{
  "jti": "rt_uuid", // Token ID
  "sub": "user_uuid",
  "iat": 1673512345,
  "exp": 1674117145 // 7 days
}

Redis Key: `session:${user_id}:${jti}`
Value: {
  user_id: 'uuid',
  device_info: {...},
  ip_address: '1.2.3.4',
  created_at: '...'
}
TTL: 7 days

// ==========================================
// Token Refresh Flow
// ==========================================

1. Client detects Access Token expired (401 response)
2. Client → POST /auth/refresh
   Body: { refresh_token: 'rt_abc123...' }
3. Server → Validate Refresh Token
   - Verify signature
   - Check expiration
   - Check Redis (not revoked)
4. Server → Generate New Access Token
5. Server → (Optional) Rotate Refresh Token
6. Server → Return New Tokens
```

### 7.3 Authorization (RBAC)

```typescript
// ==========================================
// Role Definitions
// ==========================================

enum UserRole {
  PLAYER = 'player',
  ADMIN = 'admin',
  BOT = 'bot'
}

// ==========================================
// Permission Matrix
// ==========================================

Permissions = {
  'player': [
    'game:join',
    'game:sit',
    'game:buy_cards',
    'game:claim_bingo',
    'wallet:deposit',
    'wallet:withdraw',
    'chat:send'
  ],

  'admin': [
    ...player_permissions,
    'admin:view_users',
    'admin:ban_user',
    'admin:approve_transaction',
    'admin:view_reports',
    'admin:manage_bots',
    'admin:manage_rooms',
    'admin:view_audit_logs'
  ],

  'bot': [
    'game:join',
    'game:sit',
    'game:buy_cards',
    'game:claim_bingo'
    // No wallet, no chat
  ]
}

// ==========================================
// Authorization Middleware
// ==========================================

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('/admin/users')
async getUsers() {
  // Only accessible by admins
}

// RolesGuard Implementation
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user; // From JwtAuthGuard

    return requiredRoles.some(role => user.role === role);
  }
}
```

### 7.4 Input Validation & Sanitization

```typescript
// ==========================================
// DTO Validation (class-validator)
// ==========================================

export class BuyCardsDto {
  @IsUUID()
  room_id: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}

export class WithdrawDto {
  @IsNumber()
  @Min(100)
  @Max(50000)
  amount: number;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9\s\-]+$/) // Alphanumeric + spaces + hyphens
  bank_name: string;

  @IsString()
  @Matches(/^[0-9]{10,20}$/)
  bank_account_number: string;
}

// ==========================================
// SQL Injection Prevention
// ==========================================

// ❌ NEVER do this
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ ALWAYS use parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// ==========================================
// XSS Prevention
// ==========================================

// Backend: Sanitize HTML input
import * as sanitizeHtml from 'sanitize-html';

const sanitizedMessage = sanitizeHtml(userMessage, {
  allowedTags: [], // No HTML tags allowed
  allowedAttributes: {}
});

// Frontend: Use DOMPurify
import DOMPurify from 'dompurify';

const cleanMessage = DOMPurify.sanitize(userMessage);

// CSP Headers (Helmet.js)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Avoid unsafe-inline in production
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "wss://yourdomain.com"]
  }
}));
```

### 7.5 Rate Limiting

```typescript
// ==========================================
// Application-Level Rate Limiting
// ==========================================

import * as rateLimit from 'express-rate-limit';
import * as RedisStore from 'rate-limit-redis';

// Global Rate Limiter
const globalLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min
  message: 'Too many requests, please try again later'
});

app.use(globalLimiter);

// Endpoint-Specific Rate Limiters
const authLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 min
  skipSuccessfulRequests: true
});

app.use('/api/v1/auth/google', authLimiter);

// Wallet Limiter (Stricter)
const walletLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 60 * 1000, // 1 minute
  max: 5 // 5 requests per minute
});

app.use('/api/v1/wallet', walletLimiter);

// ==========================================
// Custom Rate Limiting (WebSocket)
// ==========================================

class WebSocketRateLimiter {
  private redis: Redis;

  async checkLimit(userId: string, action: string, limit: number, windowSec: number): Promise<boolean> {
    const key = `rate_limit:${userId}:${action}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, windowSec);
    }

    return current <= limit;
  }
}

// Usage
const allowed = await rateLimiter.checkLimit(user.id, 'claim_bingo', 10, 60);
if (!allowed) {
  socket.emit('error:rate_limit_exceeded', {
    action: 'claim_bingo',
    retry_after: 60
  });
  return;
}
```

---

## 8. Anti-Cheat Architecture

### 8.1 Anti-Cheat Principles

```
┌─────────────────────────────────────────────────────────┐
│            Anti-Cheat Strategy (Zero Trust)             │
└─────────────────────────────────────────────────────────┘

1. Server as Authority
   └─ Client ไม่มีสิทธิ์ตัดสินผลเกม
   └─ Server เก็บ Game State ทั้งหมด
   └─ Client แสดงผลอย่างเดียว

2. Card Integrity
   └─ Card ถูกสร้างบน Server
   └─ มี Card Hash (SHA256) สำหรับ Verify
   └─ Client ไม่สามารถแก้ไขเลขบนการ์ดได้

3. Number Drawing
   └─ เลขสุ่มบน Server (Crypto-grade RNG)
   └─ Broadcast เลข + Timestamp
   └─ Client ไม่มีสิทธิ์เลือกเลข

4. Bingo Validation
   └─ Server ตรวจทุก Pattern
   └─ ตรวจ Timing (หลังเลขถูก Draw เท่านั้น)
   └─ ตรวจ Card Ownership
   └─ ตรวจ Card ไม่เคยชนะมาก่อน

5. Timing Attack Prevention
   └─ Server Timestamp เป็น Authority
   └─ ตรวจ Latency ผิดปกติ
   └─ Log Reaction Time

6. Rate Limiting
   └─ จำกัด Bingo Requests / minute
   └─ จำกัด Buy Card / minute
   └─ Auto-block User ที่ส่ง Request ผิดปกติ

7. Audit Trail
   └─ Log ทุก Action
   └─ เก็บ Old/New Value
   └─ Timestamp + IP Address
   └─ Immutable Logs
```

### 8.2 Server-side Bingo Validation

```typescript
// ==========================================
// Bingo Validation Engine
// ==========================================

class BingoValidator {

  /**
   * Validate Bingo Claim (CRITICAL SECURITY)
   */
  async validateBingoClaim(
    gameId: string,
    userId: string,
    cardId: string,
    claimedPattern: string,
    requestTimestamp: Date
  ): Promise<ValidationResult> {

    // 1. Verify Card Ownership
    const card = await this.cardRepository.findOne({
      where: { id: cardId, user_id: userId, game_id: gameId }
    });

    if (!card) {
      return { valid: false, reason: 'CARD_NOT_OWNED' };
    }

    // 2. Verify Card Not Already Won
    if (card.is_winner) {
      return { valid: false, reason: 'CARD_ALREADY_WON' };
    }

    // 3. Get Game State
    const game = await this.gameRepository.findOne({ where: { id: gameId } });

    if (!game || game.state !== 'running') {
      return { valid: false, reason: 'INVALID_GAME_STATE' };
    }

    // 4. Verify Card Hash (Integrity Check)
    const computedHash = this.computeCardHash(card.numbers);
    if (computedHash !== card.card_hash) {
      await this.auditService.logSecurity({
        user_id: userId,
        action: 'card_hash_mismatch',
        severity: 'critical',
        details: { card_id: cardId }
      });
      return { valid: false, reason: 'CARD_TAMPERED' };
    }

    // 5. Check Pattern Completion
    const isPatternComplete = this.checkPattern(
      card.numbers,
      game.drawn_numbers,
      claimedPattern
    );

    if (!isPatternComplete) {
      return { valid: false, reason: 'PATTERN_INCOMPLETE' };
    }

    // 6. Find Minimum Balls Required
    const ballsRequired = this.findMinBallsForPattern(
      card.numbers,
      game.drawn_numbers,
      claimedPattern
    );

    // 7. Find When Pattern Was Completed
    const completionBallIndex = this.findPatternCompletionIndex(
      card.numbers,
      game.drawn_numbers,
      claimedPattern
    );

    const completionBall = game.drawn_numbers[completionBallIndex];
    const completionTime = game.ball_timestamps[completionBallIndex]; // Server time

    // 8. Verify Request Came AFTER Pattern Completion
    if (requestTimestamp < completionTime) {
      await this.auditService.logSecurity({
        user_id: userId,
        action: 'bingo_before_completion',
        severity: 'high',
        details: {
          card_id: cardId,
          request_time: requestTimestamp,
          completion_time: completionTime
        }
      });
      return { valid: false, reason: 'BINGO_BEFORE_PATTERN_COMPLETE' };
    }

    // 9. Check Reaction Time (Anti-Bot Detection)
    const reactionTime = requestTimestamp.getTime() - completionTime.getTime();

    if (reactionTime < 100) { // Less than 100ms = suspicious
      await this.auditService.logSecurity({
        user_id: userId,
        action: 'superhuman_reaction',
        severity: 'medium',
        details: {
          card_id: cardId,
          reaction_time_ms: reactionTime
        }
      });
      // Don't reject yet, but flag for review
    }

    // 10. Rate Limit Check
    const isRateLimited = await this.rateLimiter.checkLimit(
      userId,
      'claim_bingo',
      10, // 10 attempts
      60  // per minute
    );

    if (!isRateLimited) {
      return { valid: false, reason: 'RATE_LIMIT_EXCEEDED' };
    }

    // 11. All Checks Passed
    return {
      valid: true,
      balls_to_win: ballsRequired,
      reaction_time_ms: reactionTime,
      completion_ball: completionBall
    };
  }

  /**
   * Check if pattern is complete
   */
  private checkPattern(
    cardNumbers: number[][],
    drawnNumbers: number[],
    pattern: string
  ): boolean {
    const drawnSet = new Set(drawnNumbers);

    switch (pattern) {
      case 'horizontal_1':
        return cardNumbers[0].every(num => drawnSet.has(num));

      case 'horizontal_2':
        return cardNumbers[1].every(num => drawnSet.has(num));

      case 'vertical_1':
        return cardNumbers.every(row => drawnSet.has(row[0]));

      case 'diagonal_1':
        return cardNumbers.every((row, i) => drawnSet.has(row[i]));

      case 'full_card':
        return cardNumbers.every(row =>
          row.every(num => drawnSet.has(num))
        );

      // ... more patterns

      default:
        return false;
    }
  }

  /**
   * Find minimum balls required to complete pattern
   */
  private findMinBallsForPattern(
    cardNumbers: number[][],
    drawnNumbers: number[],
    pattern: string
  ): number {
    const requiredNumbers = this.getRequiredNumbersForPattern(cardNumbers, pattern);

    let maxIndex = -1;
    for (const num of requiredNumbers) {
      const index = drawnNumbers.indexOf(num);
      if (index > maxIndex) maxIndex = index;
    }

    return maxIndex + 1; // Ball count (1-indexed)
  }

  /**
   * Compute Card Hash (SHA256)
   */
  private computeCardHash(numbers: number[][]): string {
    const crypto = require('crypto');
    const jsonString = JSON.stringify(numbers);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }
}
```

### 8.3 Timing Attack Prevention

```typescript
// ==========================================
// Ball Draw with Server Timestamp
// ==========================================

class GameEngine {

  async drawBall(gameId: string): Promise<void> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });

    // 1. Generate Random Number (Crypto-grade)
    const availableNumbers = this.getAvailableNumbers(
      game.ball_set,
      game.drawn_numbers
    );

    const ball = this.cryptoRandomPick(availableNumbers);

    // 2. Record Server Timestamp (AUTHORITY)
    const serverTimestamp = new Date();

    // 3. Update Game State
    game.drawn_numbers.push(ball);
    game.ball_timestamps.push(serverTimestamp); // Critical!
    game.total_balls_drawn++;

    await this.gameRepository.save(game);

    // 4. Broadcast to All Clients
    this.socketGateway.broadcastToRoom(game.room_id, 'game:ball_drawn', {
      room_id: game.room_id,
      game_id: gameId,
      ball: ball,
      total_balls: game.total_balls_drawn,
      drawn_numbers: game.drawn_numbers,
      server_timestamp: serverTimestamp.toISOString() // ISO 8601
    });

    // 5. Check if Any Cards Can Bingo
    await this.checkPossibleBingos(gameId);
  }

  /**
   * Cryptographically Secure Random Number
   */
  private cryptoRandomPick(arr: number[]): number {
    const crypto = require('crypto');
    const randomIndex = crypto.randomInt(0, arr.length);
    return arr[randomIndex];
  }
}

// ==========================================
// Client Timestamp Rejection
// ==========================================

// ❌ NEVER trust client timestamp
async handleBingoClaim(payload: any) {
  // Ignore payload.client_timestamp
  const serverTimestamp = new Date(); // Use server time only

  await this.bingoValidator.validateBingoClaim(
    payload.game_id,
    payload.user_id,
    payload.card_id,
    payload.pattern,
    serverTimestamp // Server time is authority
  );
}
```

### 8.4 Fraud Detection System

```typescript
// ==========================================
// Fraud Detection Service
// ==========================================

class FraudDetectionService {

  /**
   * Calculate User Risk Score (0-10)
   */
  async calculateRiskScore(userId: string): Promise<number> {
    let score = 0;

    // 1. Check Win Rate
    const winRate = await this.getUserWinRate(userId);
    if (winRate > 0.7) score += 3; // 70%+ win rate = suspicious

    // 2. Check Average Reaction Time
    const avgReactionTime = await this.getAvgReactionTime(userId);
    if (avgReactionTime < 200) score += 2; // < 200ms = superhuman

    // 3. Check Failed Bingo Attempts
    const failedAttempts = await this.getFailedBingoAttempts(userId, '5 minutes');
    if (failedAttempts > 5) score += 2; // Spam detection

    // 4. Check Account Age
    const accountAge = await this.getAccountAgeDays(userId);
    if (accountAge < 1) score += 1; // New account

    // 5. Check Unusual Patterns
    const isUnusualPattern = await this.detectUnusualPatterns(userId);
    if (isUnusualPattern) score += 2;

    return Math.min(score, 10);
  }

  /**
   * Auto-flag Suspicious Users
   */
  async checkAndFlagUser(userId: string): Promise<void> {
    const riskScore = await this.calculateRiskScore(userId);

    if (riskScore >= 8) {
      // Critical Risk → Auto-ban
      await this.userService.banUser(userId, 'Auto-ban: High risk score');

      // Notify Admin
      await this.notificationService.sendAdminAlert({
        type: 'auto_ban',
        user_id: userId,
        risk_score: riskScore,
        timestamp: new Date()
      });

    } else if (riskScore >= 5) {
      // Medium Risk → Flag for Review
      await this.auditService.logSecurity({
        user_id: userId,
        action: 'flagged_for_review',
        severity: 'medium',
        details: { risk_score: riskScore }
      });

      // Notify Admin
      await this.notificationService.sendAdminAlert({
        type: 'suspicious_activity',
        user_id: userId,
        risk_score: riskScore
      });
    }
  }

  /**
   * Detect Unusual Patterns (ML-ready)
   */
  private async detectUnusualPatterns(userId: string): Promise<boolean> {
    // 1. Check if user always wins on last ball
    const lastBallWins = await this.getLastBallWinCount(userId);
    if (lastBallWins > 5) return true;

    // 2. Check if user always buys same card count
    const cardVariance = await this.getCardPurchaseVariance(userId);
    if (cardVariance < 0.1) return true; // Too consistent

    // 3. Check if user only plays at certain times
    const timePattern = await this.getPlayTimePattern(userId);
    if (timePattern.entropy < 0.3) return true; // Bot-like behavior

    return false;
  }
}

// ==========================================
// Real-time Fraud Monitoring
// ==========================================

@WebSocketGateway()
export class FraudMonitoringGateway {

  @SubscribeMessage('game:claim_bingo')
  async handleBingoClaim(client: Socket, payload: any) {
    const user = client.data.user;

    // 1. Validate Bingo
    const result = await this.bingoValidator.validateBingoClaim(...);

    // 2. If Valid → Check for Fraud
    if (result.valid) {
      await this.fraudDetection.checkAndFlagUser(user.id);
    }

    // 3. If Invalid → Log Attempt
    if (!result.valid) {
      await this.auditService.log({
        user_id: user.id,
        action: 'failed_bingo_claim',
        metadata: {
          reason: result.reason,
          card_id: payload.card_id,
          pattern: payload.pattern
        }
      });
    }
  }
}
```

---

## 9. Deployment Architecture

### 9.1 Environment Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                   Deployment Environments               │
└─────────────────────────────────────────────────────────┘

1. Development (Local macOS)
   ├─ Backend: localhost:8001
   ├─ WebSocket: localhost:8002
   ├─ Frontend: localhost:3001
   ├─ PostgreSQL: localhost:5432
   ├─ Redis: localhost:6379
   └─ Docker Compose (all services)

2. Staging (Railway / DigitalOcean)
   ├─ Backend: staging-api.yourdomain.com
   ├─ WebSocket: staging-ws.yourdomain.com
   ├─ Frontend: staging.yourdomain.com
   ├─ Database: Managed PostgreSQL
   ├─ Cache: Managed Redis
   └─ Purpose: Pre-production testing

3. Production (DigitalOcean / AWS)
   ├─ Backend: api.yourdomain.com
   ├─ WebSocket: ws.yourdomain.com
   ├─ Frontend: yourdomain.com
   ├─ Database: Managed PostgreSQL (Auto-backup)
   ├─ Cache: Redis Cluster
   ├─ CDN: Cloudflare
   └─ Monitoring: Sentry + LogRocket
```

### 9.2 Docker Architecture (MVP)

```yaml
# ==========================================
# docker-compose.yml (Development)
# ==========================================

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: bingo_postgres
    environment:
      POSTGRES_DB: bingo_party
      POSTGRES_USER: bingo_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - bingo_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bingo_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: bingo_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - bingo_network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API Server
  api-server:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bingo_api
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://bingo_user:${DB_PASSWORD}@postgres:5432/bingo_party
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    ports:
      - "8001:8001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - bingo_network
    command: npm run start:dev

  # WebSocket Server
  ws-server:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bingo_ws
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://bingo_user:${DB_PASSWORD}@postgres:5432/bingo_party
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8002:8002"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - bingo_network
    command: npm run start:ws

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: bingo_frontend
    environment:
      VITE_API_URL: http://localhost:8001/api/v1
      VITE_WS_URL: ws://localhost:8002
    ports:
      - "3001:3001"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - bingo_network
    command: npm run dev -- --host 0.0.0.0 --port 3001

  # Nginx (Optional - for production)
  # nginx:
  #   image: nginx:alpine
  #   container_name: bingo_nginx
  #   ports:
  #     - "80:80"
  #     - "443:443"
  #   volumes:
  #     - ./nginx.conf:/etc/nginx/nginx.conf
  #     - ./ssl:/etc/nginx/ssl
  #   depends_on:
  #     - api-server
  #     - ws-server
  #     - frontend
  #   networks:
  #     - bingo_network

volumes:
  postgres_data:
  redis_data:

networks:
  bingo_network:
    driver: bridge
```

### 9.3 Production Deployment (DigitalOcean)

```
┌─────────────────────────────────────────────────────────┐
│            Production Architecture (Phase 2-3)          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     Cloudflare CDN                      │
│  ├─ DDoS Protection                                     │
│  ├─ SSL Termination                                     │
│  ├─ Static Asset Caching                               │
│  └─ WAF (Web Application Firewall)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              DigitalOcean Load Balancer                 │
│  ├─ Health Checks                                       │
│  ├─ SSL Passthrough (WebSocket)                        │
│  └─ Round Robin                                         │
└─────────────────────────────────────────────────────────┘
           ↓                              ↓
  ┌─────────────────┐          ┌─────────────────┐
  │  API Server 1   │          │  API Server 2   │
  │  (Droplet)      │          │  (Droplet)      │
  │  8GB RAM        │          │  8GB RAM        │
  └─────────────────┘          └─────────────────┘
           ↓                              ↓
  ┌─────────────────┐          ┌─────────────────┐
  │  WS Server 1    │          │  WS Server 2    │
  │  (Droplet)      │          │  (Droplet)      │
  │  8GB RAM        │          │  8GB RAM        │
  └─────────────────┘          └─────────────────┘
           ↓                              ↓
         ┌─────────────────────────────────┐
         │     Redis Pub/Sub Cluster       │
         │  (Managed Redis - 2GB)          │
         └─────────────────────────────────┘
                         ↓
         ┌─────────────────────────────────┐
         │  PostgreSQL (Managed Database)  │
         │  ├─ Primary (Read/Write)        │
         │  ├─ Replica (Read-Only)         │
         │  └─ Auto-Backup (Daily)         │
         └─────────────────────────────────┘
                         ↓
         ┌─────────────────────────────────┐
         │    DigitalOcean Spaces (S3)     │
         │  (File Storage: Receipts, etc.) │
         └─────────────────────────────────┘

Monitoring:
├─ Sentry (Error Tracking)
├─ LogRocket (Session Replay)
├─ Uptime Robot (Health Monitoring)
└─ DigitalOcean Monitoring (Server Metrics)
```

### 9.4 CI/CD Pipeline (GitHub Actions)

```yaml
# ==========================================
# .github/workflows/deploy.yml
# ==========================================

name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: bingo_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run Backend Tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/bingo_test
          REDIS_URL: redis://localhost:6379
        run: npm test

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run Frontend Tests
        working-directory: ./frontend
        run: npm test

      - name: E2E Tests (Playwright)
        working-directory: ./e2e
        run: npx playwright test

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Backend Image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: yourusername/bingo-backend:${{ github.sha }},yourusername/bingo-backend:latest

      - name: Build and Push WebSocket Image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: yourusername/bingo-ws:${{ github.sha }},yourusername/bingo-ws:latest

      - name: Build and Push Frontend Image
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: yourusername/bingo-frontend:${{ github.sha }},yourusername/bingo-frontend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to DigitalOcean
        uses: appleboy/ssh-action@v0.1.8
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /opt/bingo-party
            docker-compose pull
            docker-compose up -d
            docker system prune -f

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to Production completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 10. Port Configuration (macOS)

### 10.1 Default Ports

```bash
# ==========================================
# Development Ports (macOS)
# ==========================================

Frontend (Vite):        3001
API Server:             8001
WebSocket Server:       8002
PostgreSQL:             5432
Redis:                  6379

# ==========================================
# Why These Ports?
# ==========================================

✅ 3001 (Frontend)
   - ไม่ชนกับ Create React App (3000)
   - ไม่ชนกับ Next.js (3000)
   - ไม่ชนกับ Rails (3000)

✅ 8001 (API)
   - ไม่ชนกับ common ports (8000, 8080)
   - Easy to remember (80 + 01)

✅ 8002 (WebSocket)
   - ติดกับ API port (8001, 8002)
   - แยก process ได้ง่าย

✅ 5432 (PostgreSQL)
   - Default PostgreSQL port
   - Standard across environments

✅ 6379 (Redis)
   - Default Redis port
   - Standard across environments
```

### 10.2 Port Check Commands (macOS)

```bash
# ==========================================
# Check if Port is in Use
# ==========================================

# Check single port
lsof -i :3001

# Check all used ports
lsof -i -P | grep LISTEN

# Check specific service
lsof -i :5432 | grep LISTEN

# ==========================================
# Kill Process on Port
# ==========================================

# Find PID
lsof -ti :3001

# Kill process
kill -9 $(lsof -ti :3001)

# One-liner
lsof -ti :3001 | xargs kill -9

# ==========================================
# Environment Variable (Port Override)
# ==========================================

# .env.development
FRONTEND_PORT=3001
API_PORT=8001
WS_PORT=8002
DB_PORT=5432
REDIS_PORT=6379

# Usage in code
const PORT = process.env.API_PORT || 8001;
```

### 10.3 macOS Firewall Configuration

```bash
# ==========================================
# Allow Ports in macOS Firewall
# ==========================================

# Open System Preferences → Security & Privacy → Firewall
# Or use pfctl (advanced)

# Add Firewall Rule (Advanced)
sudo pfctl -e # Enable firewall
sudo pfctl -F all # Flush rules

# Allow Node.js
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node

# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

---

## 11. Performance Requirements

### 11.1 Performance Targets

```
┌─────────────────────────────────────────────────────────┐
│                  Performance SLA                        │
└─────────────────────────────────────────────────────────┘

API Response Time:
├─ P50: < 100ms
├─ P95: < 300ms
└─ P99: < 500ms

WebSocket Latency:
├─ P50: < 50ms
├─ P95: < 200ms
└─ P99: < 500ms

Database Query:
├─ Simple SELECT: < 10ms
├─ JOIN Query: < 50ms
└─ Transaction: < 100ms

Page Load:
├─ First Contentful Paint: < 1.5s
├─ Time to Interactive: < 3s
└─ Fully Loaded: < 5s

Concurrent Users:
├─ MVP: 50 users
├─ Phase 1: 200 users
└─ Phase 2+: 1000+ users

Uptime:
├─ MVP: 95%
├─ Phase 1: 98%
└─ Phase 2+: 99.9%
```

### 11.2 Optimization Strategies

```typescript
// ==========================================
// 1. Database Optimization
// ==========================================

// Connection Pooling
const pool = new Pool({
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query Optimization
// ✅ Use Indexes
CREATE INDEX idx_games_room_state ON games(room_id, state);

// ✅ Use SELECT specific columns (not *)
SELECT id, name, state FROM rooms WHERE is_active = true;

// ✅ Use LIMIT for pagination
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 20 OFFSET 0;

// ✅ Use Prepared Statements
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ==========================================
// 2. Redis Caching
// ==========================================

// Cache Frequently Accessed Data
async getUser(userId: string) {
  // Try Cache First
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  // Cache Miss → Database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // Store in Cache (TTL: 5 min)
  await redis.setex(`user:${userId}`, 300, JSON.stringify(user));

  return user;
}

// Cache Game State (Shorter TTL)
async getGameState(gameId: string) {
  const cached = await redis.get(`game:${gameId}`);
  if (cached) return JSON.parse(cached);

  const game = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);

  // TTL: 10 seconds (game state changes frequently)
  await redis.setex(`game:${gameId}`, 10, JSON.stringify(game));

  return game;
}

// ==========================================
// 3. WebSocket Optimization
// ==========================================

// Room-based Broadcasting (Don't broadcast to everyone)
io.to(roomId).emit('game:ball_drawn', payload);

// Binary Protocol (Socket.io supports)
socket.emit('game:state', Buffer.from(JSON.stringify(state)));

// Throttle High-Frequency Events
const throttledBroadcast = throttle((roomId, event, data) => {
  io.to(roomId).emit(event, data);
}, 100); // Max 10 events/second

// ==========================================
// 4. Frontend Optimization
// ==========================================

// Code Splitting (React)
const AdminPanel = lazy(() => import('./components/AdminPanel'));

// Memoization
const MemoizedCard = React.memo(BingoCard);

// Virtual Scrolling (Large Lists)
import { FixedSizeList } from 'react-window';

// Debounce User Input
const debouncedSearch = debounce((query) => {
  searchRooms(query);
}, 300);

// ==========================================
// 5. Asset Optimization
// ==========================================

// Image Optimization
// ✅ Use WebP format
// ✅ Lazy loading
<img src="..." loading="lazy" />

// ✅ CDN for static assets
const ASSET_URL = 'https://cdn.yourdomain.com';

// Bundle Size Optimization
// ✅ Tree shaking (Vite does this automatically)
// ✅ Compression (gzip/brotli)

// Nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 12. Scalability Strategy

### 12.1 Horizontal Scaling Plan

```
┌─────────────────────────────────────────────────────────┐
│              Scaling Roadmap (3 Phases)                 │
└─────────────────────────────────────────────────────────┘

Phase 0 (MVP): Single Server
├─ 1x Droplet (4GB RAM, 2 vCPU)
├─ All services on one machine (Docker Compose)
├─ PostgreSQL + Redis on same server
└─ Cost: ~$20/month

Phase 1 (50-200 users): Separate Services
├─ 1x API Server (4GB)
├─ 1x WebSocket Server (4GB)
├─ 1x Managed PostgreSQL (2GB)
├─ 1x Managed Redis (1GB)
└─ Cost: ~$100/month

Phase 2 (200-500 users): Load Balancing
├─ 2x API Servers (8GB each)
├─ 2x WebSocket Servers (8GB each)
├─ 1x Load Balancer
├─ 1x Managed PostgreSQL (4GB + Replica)
├─ 1x Redis Cluster (2GB)
└─ Cost: ~$300/month

Phase 3 (500+ users): Auto-Scaling
├─ Auto-scaling API Servers (3-10 instances)
├─ Auto-scaling WebSocket Servers (3-10 instances)
├─ PostgreSQL Cluster (Primary + 2 Replicas)
├─ Redis Cluster (3 nodes)
├─ CDN (Cloudflare)
└─ Cost: ~$500-1000/month
```

### 12.2 Database Scaling

```sql
-- ==========================================
-- Read Replica Strategy
-- ==========================================

-- Write Operations → Primary Database
INSERT INTO transactions (...) VALUES (...);
UPDATE users SET point_balance = ... WHERE id = ...;

-- Read Operations → Read Replica
SELECT * FROM games WHERE room_id = ...;
SELECT * FROM leaderboard ORDER BY wins DESC;

-- ==========================================
-- Partitioning (Large Tables)
-- ==========================================

-- Partition transactions by month
CREATE TABLE transactions_2026_01 PARTITION OF transactions
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE transactions_2026_02 PARTITION OF transactions
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- ==========================================
-- Archiving Old Data
-- ==========================================

-- Archive games older than 3 months
INSERT INTO games_archive SELECT * FROM games WHERE created_at < NOW() - INTERVAL '3 months';
DELETE FROM games WHERE created_at < NOW() - INTERVAL '3 months';
```

### 12.3 Redis Clustering

```typescript
// ==========================================
// Redis Pub/Sub for Multi-Server
// ==========================================

// Server 1 publishes event
await redis.publish('game:events', JSON.stringify({
  room_id: 'uuid',
  event: 'ball_drawn',
  data: { ball: 42 }
}));

// All Servers subscribe
redis.subscribe('game:events');
redis.on('message', (channel, message) => {
  const event = JSON.parse(message);

  // Broadcast to connected WebSocket clients
  io.to(event.room_id).emit(event.event, event.data);
});

// ==========================================
// Sticky Sessions (WebSocket)
// ==========================================

// Load Balancer (Nginx)
upstream websocket_backend {
  ip_hash; # Sticky session based on IP
  server ws-server-1:8002;
  server ws-server-2:8002;
}

// OR use Socket.io Adapter
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

---

## 13. Summary & Next Steps

### 13.1 Architecture Highlights

```
✅ 3-Tier Architecture (Client → App → Data)
✅ Real-time WebSocket Layer (Socket.io)
✅ Transaction-Safe Wallet (PostgreSQL ACID)
✅ Multi-Layer Security (Defense in Depth)
✅ Anti-Cheat Engine (Server-side Validation)
✅ Scalability Ready (Horizontal Scaling)
✅ macOS Compatible (Custom Ports)
✅ CI/CD Pipeline (GitHub Actions)
```

### 13.2 Tech Stack Summary

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React 18 + TypeScript + Vite | Modern, Fast, Type-Safe |
| **State Management** | Zustand | Simple, No Boilerplate |
| **UI Library** | Ant Design | Enterprise Components |
| **Backend** | NestJS (Node.js + TypeScript) | Modular, Scalable |
| **Database** | PostgreSQL 16 | ACID, Reliable |
| **Cache** | Redis 7 | Fast, Pub/Sub |
| **Real-time** | Socket.io | Auto-Reconnect, Rooms |
| **Queue** | BullMQ | Redis-based, Reliable |
| **Auth** | Google OAuth + JWT | Secure, Simple |
| **Hosting** | Railway → DigitalOcean → AWS | Cost-effective Scaling |
| **CI/CD** | GitHub Actions | Free, Integrated |
| **Monitoring** | Sentry + LogRocket | Error + Session Tracking |

### 13.3 Critical Success Factors

1. **Security First**
   - Server-side validation ทุกอย่าง
   - Audit Log ครบถ้วน
   - Anti-Cheat Engine แข็งแกร่ง

2. **Transaction Safety**
   - Database Transaction (ACID)
   - Idempotent Operations
   - Balance Reconciliation

3. **Real-time Performance**
   - WebSocket Latency < 200ms
   - Redis Caching
   - Efficient Broadcasting

4. **Scalability**
   - Stateless Services
   - Horizontal Scaling Ready
   - Load Balancing

### 13.4 Next Steps for Development Team

```
┌─────────────────────────────────────────────────────────┐
│              ขั้นตอนถัดไป (Week 1)                      │
└─────────────────────────────────────────────────────────┘

Backend Developer (`claude --agent backend`):
├─ [ ] Setup NestJS Project
├─ [ ] Setup PostgreSQL Database
├─ [ ] Implement Database Schema (Section 4)
├─ [ ] Implement Google OAuth
└─ [ ] Implement Wallet Service

Frontend Developer (`claude --agent frontend`):
├─ [ ] Setup React + Vite Project
├─ [ ] Setup Zustand Store
├─ [ ] Create UI Components (Ant Design)
├─ [ ] Implement Login Flow
└─ [ ] Create Lobby Page

DevOps Engineer (`claude --agent devops`):
├─ [ ] Setup Docker Compose
├─ [ ] Configure Ports (Section 10)
├─ [ ] Setup Development Environment
└─ [ ] Setup CI/CD Pipeline

QA Engineer (`claude --agent qa`):
├─ [ ] Create Test Plan
├─ [ ] Setup Jest + Playwright
└─ [ ] Create Security Test Cases
```

---

## 14. Appendix

### 14.1 Glossary

- **ACID**: Atomicity, Consistency, Isolation, Durability (Database Properties)
- **JWT**: JSON Web Token (Authentication)
- **RBAC**: Role-Based Access Control
- **WebSocket**: Full-duplex communication protocol
- **Redis Pub/Sub**: Publish-Subscribe messaging pattern
- **Idempotent**: Operation that produces same result regardless of how many times executed

### 14.2 References

- Spec Document: `/Users/masterjob/Claude Code Project/bingo-party-enterprise-spec.md`
- Roadmap: `/Users/masterjob/Claude Code Project/pm-roadmap.md`
- CLAUDE.md: `/Users/masterjob/Claude Code Project/CLAUDE.md`

### 14.3 Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-12 | 1.0 | Initial Architecture Design | เม (System Architect) |

---

**สรุป**: Architecture นี้ออกแบบมาเพื่อให้ระบบ **ปลอดภัย, รวดเร็ว, และ Scale ได้** โดยเน้นที่ Server-side Validation, Transaction Safety, และ Anti-Cheat ที่แข็งแกร่ง พร้อมทั้งรองรับการใช้งานบน macOS โดยไม่มีปัญหา Port ชน 🎯

**พร้อมเริ่มพัฒนาแล้วค่ะที่รัก!** 💕✨
