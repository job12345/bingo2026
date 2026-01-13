# 🗄️ Bingo Party Enterprise – Database Schema Design

**Database Administrator**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**Database**: PostgreSQL 16
**สถานะ**: Ready for Implementation

---

## 📑 Table of Contents

1. [ภาพรวม Schema](#1-ภาพรวม-schema)
2. [ERD (Entity Relationship Diagram)](#2-erd-entity-relationship-diagram)
3. [รายละเอียด Tables](#3-รายละเอียด-tables)
4. [Indexes & Performance](#4-indexes--performance)
5. [Constraints & Business Rules](#5-constraints--business-rules)
6. [Transaction Patterns](#6-transaction-patterns)
7. [Query Optimization](#7-query-optimization)
8. [Audit Trail Strategy](#8-audit-trail-strategy)
9. [Backup & Recovery](#9-backup--recovery)
10. [Migration Strategy](#10-migration-strategy)

---

## 1. ภาพรวม Schema

### 1.1 Database Design Principles

ระบบ Bingo Party Enterprise ออกแบบ Database ตามหลักการ:

1. **ACID Compliance** - Transaction Safety สำหรับการเงิน
2. **Audit Trail** - บันทึกทุกการเปลี่ยนแปลงที่สำคัญ
3. **Performance First** - Indexes ที่เหมาะสม
4. **Scalability** - รองรับข้อมูลเพิ่มขึ้น
5. **Data Integrity** - Foreign Keys, Constraints ครบถ้วน

### 1.2 สถิติ Tables

```
📊 Total Tables: 12
├─ Core Tables: 8
│  ├─ users (ผู้ใช้งาน)
│  ├─ sessions (Session Management)
│  ├─ transactions (ธุรกรรมการเงิน)
│  ├─ rooms (ห้องเกม)
│  ├─ games (รอบเกม)
│  ├─ game_participants (ผู้เข้าร่วมเกม)
│  ├─ cards (การ์ดบิงโก)
│  └─ bingo_requests (คำขอ Bingo)
│
├─ Support Tables: 2
│  ├─ bot_configs (การตั้งค่า Ghost Bot)
│  └─ chat_messages (ข้อความแชท)
│
└─ System Tables: 2
   ├─ audit_logs (บันทึกการตรวจสอบ)
   └─ system_settings (การตั้งค่าระบบ)
```

### 1.3 ขนาด Storage คาดการณ์

```
📈 Storage Estimates (6 เดือน)

ผู้ใช้ 500 คน/วัน × 180 วัน = 90,000 users
├─ users: ~10 MB
├─ sessions: ~20 MB
└─ transactions: ~500 MB (10 txn/user/day)

เกม 2,000 รอบ/วัน × 180 วัน = 360,000 games
├─ rooms: ~5 MB
├─ games: ~200 MB
├─ game_participants: ~150 MB
├─ cards: ~1.5 GB (10 cards/game)
└─ bingo_requests: ~300 MB

Audit & Support
├─ audit_logs: ~1 GB
├─ chat_messages: ~200 MB
└─ bot_configs: ~1 MB

📦 Total: ~4 GB (6 เดือน)
💾 Recommended: 20 GB Database (รองรับ Growth)
```

---

## 2. ERD (Entity Relationship Diagram)

### 2.1 ความสัมพันธ์หลัก (Core Relationships)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ERD: Bingo Party Enterprise                    │
└─────────────────────────────────────────────────────────────────────┘

        ┌──────────────┐
        │    users     │ ◄──────┐
        │              │        │
        │ - id (PK)    │        │ 1
        │ - google_id  │        │
        │ - email      │        │
        │ - role       │        │
        │ - balance    │        │
        └──────────────┘        │
             │                  │
             │ 1                │
             │                  │
             ▼ ∞                │
        ┌──────────────┐        │
        │ transactions │        │
        │              │        │
        │ - id (PK)    │        │
        │ - user_id    │────────┘
        │ - type       │
        │ - amount     │
        │ - status     │
        └──────────────┘

        ┌──────────────┐
        │    rooms     │ ◄────────┐
        │              │          │
        │ - id (PK)    │          │ 1
        │ - creator_id │          │
        │ - card_price │          │
        │ - state      │          │
        └──────────────┘          │
             │                    │
             │ 1                  │
             │                    │
             ▼ ∞                  │
        ┌──────────────┐          │
        │    games     │          │
        │              │          │
        │ - id (PK)    │          │
        │ - room_id    │──────────┘
        │ - round_num  │
        │ - state      │
        │ - winner_id  │───┐
        └──────────────┘   │
             │             │
             │ 1           │ ∞
             │             │
             ▼ ∞           │
        ┌──────────────┐   │     ┌──────────────┐
        │    cards     │   │     │game_partici- │
        │              │   │     │    pants     │
        │ - id (PK)    │   │     │              │
        │ - game_id    │   │     │ - game_id    │
        │ - user_id    │───┼─────│ - user_id    │
        │ - numbers    │   │     └──────────────┘
        │ - card_hash  │   │
        └──────────────┘   │
             │             │
             │ 1           │
             │             │
             ▼ ∞           │
        ┌──────────────┐   │
        │bingo_requests│   │
        │              │   │
        │ - id (PK)    │   │
        │ - game_id    │   │
        │ - user_id    │───┘
        │ - card_id    │
        │ - is_valid   │
        └──────────────┘
```

### 2.2 ความสัมพันธ์เสริม (Support Relationships)

```
┌──────────────┐
│    users     │
└──────────────┘
     │
     │ 1
     │
     ▼ ∞
┌──────────────┐     ┌──────────────┐
│  audit_logs  │     │  bot_configs │
│              │     │              │
│ - user_id    │     │ - bot_user_id│
│ - action     │     │ - constraints│
│ - entity_id  │     └──────────────┘
└──────────────┘

┌──────────────┐
│    rooms     │
└──────────────┘
     │
     │ 1
     │
     ▼ ∞
┌──────────────┐
│chat_messages │
│              │
│ - room_id    │
│ - user_id    │
│ - content    │
└──────────────┘
```

---

## 3. รายละเอียด Tables

### 3.1 Users & Authentication

#### Table: `users`

**วัตถุประสงค์**: เก็บข้อมูลผู้ใช้งานทั้งหมด (Player, Admin, Bot)

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google OAuth
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,

  -- Role
  role user_role DEFAULT 'player',

  -- Wallet (1 Point = 1 บาท)
  point_balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (point_balance >= 0),

  -- Bank Info (สำหรับถอนเงิน)
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
```

**Columns สำคัญ:**

| Column | Type | Description | Constraint |
|--------|------|-------------|------------|
| `id` | UUID | Primary Key | Auto-generated |
| `google_id` | VARCHAR(255) | Google User ID | UNIQUE, NOT NULL |
| `email` | VARCHAR(255) | Email | UNIQUE, NOT NULL |
| `role` | ENUM | player/admin/bot | Default: player |
| `point_balance` | DECIMAL(12,2) | ยอดเงิน Point | >= 0 |

**Indexes:**
- `idx_users_google_id` - สำหรับ Login
- `idx_users_email` - สำหรับค้นหา
- `idx_users_role` - สำหรับกรอง

---

#### Table: `sessions`

**วัตถุประสงค์**: เก็บ Session และ Refresh Token

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Token
  refresh_token TEXT NOT NULL,

  -- Device Info
  device_info JSONB,
  ip_address INET,

  -- Expiry
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Cleanup Strategy:**
```sql
-- ลบ Session หมดอายุทุกวัน (via Cron)
DELETE FROM sessions WHERE expires_at < NOW();
```

---

### 3.2 Financial System

#### Table: `transactions`

**วัตถุประสงค์**: บันทึกธุรกรรมการเงินทั้งหมด (Audit Trail)

```sql
CREATE TABLE transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

  -- Transaction Details
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  status transaction_status DEFAULT 'pending',

  -- Balance Snapshot (สำคัญ!)
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,

  -- Payment Info (สำหรับ deposit/withdraw)
  payment_slip_url TEXT,
  bank_transfer_id VARCHAR(100),

  -- Approval (Admin)
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  -- Metadata
  metadata JSONB, -- { game_id, card_id, room_id, ... }
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Transaction Types:**

| Type | Description | Example |
|------|-------------|---------|
| `deposit` | เติมเงิน | User โอนเงิน 1,000 บาท |
| `withdraw` | ถอนเงิน | User ถอน 500 บาท |
| `card_purchase` | ซื้อการ์ด | ซื้อการ์ด 2 ใบ @ 100 = 200 |
| `payout` | รับเงินรางวัล | ชนะ Bingo รับ 900 Point |
| `refund` | คืนเงิน | ยกเลิกเกม |
| `fee` | ค่าธรรมเนียม | ระบบหัก 10% |

**Transaction Status:**

| Status | Description |
|--------|-------------|
| `pending` | รอดำเนินการ |
| `completed` | สำเร็จ |
| `rejected` | ถูกปฏิเสธ |
| `cancelled` | ยกเลิก |

**ตัวอย่าง Transaction Record:**

```json
{
  "id": "txn_123",
  "user_id": "user_456",
  "type": "card_purchase",
  "amount": 200.00,
  "status": "completed",
  "balance_before": 1500.00,
  "balance_after": 1300.00,
  "metadata": {
    "game_id": "game_789",
    "card_ids": ["card_1", "card_2"],
    "room_id": "room_101",
    "card_price": 100.00,
    "quantity": 2
  },
  "created_at": "2026-01-12T10:30:00Z"
}
```

**Indexes:**
```sql
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Composite Index สำหรับ Query บ่อย
CREATE INDEX idx_transactions_user_status_created
  ON transactions(user_id, status, created_at DESC);

-- Partial Index สำหรับ Pending Transactions
CREATE INDEX idx_transactions_pending
  ON transactions(created_at DESC)
  WHERE status = 'pending';
```

---

### 3.3 Game System

#### Table: `rooms`

**วัตถุประสงค์**: ห้องเกมบิงโก

```sql
CREATE TABLE rooms (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,

  -- Owner
  creator_id UUID REFERENCES users(id),

  -- Configuration
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
```

**Game States:**

```
IDLE → WAITING_FOR_ROUND → SITTING_PHASE → BUYING_PHASE
  → GAME_RUNNING → BINGO_RACE → WINNER_DECLARED
  → PAYOUT → COOLDOWN → (loop back to WAITING_FOR_ROUND)
```

---

#### Table: `games`

**วัตถุประสงค์**: รอบเกม (Game Round)

```sql
CREATE TABLE games (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,

  round_number INT NOT NULL,

  -- Game State
  state game_state DEFAULT 'waiting',

  -- Numbers Drawn
  drawn_numbers INT[], -- [1, 45, 23, 67, ...]
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
  balls_to_win INT, -- จำนวนลูกที่ใช้ชนะ

  -- Timestamps
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Winning Patterns (75-Ball Bingo):**

| Pattern | Description |
|---------|-------------|
| `horizontal_1` | แถวบนสุด |
| `horizontal_2` | แถวที่ 2 |
| `horizontal_3` | แถวกลาง |
| `horizontal_4` | แถวที่ 4 |
| `horizontal_5` | แถวล่าง |
| `vertical_1` | คอลัมน์ B |
| `vertical_2` | คอลัมน์ I |
| `vertical_3` | คอลัมน์ N |
| `vertical_4` | คอลัมน์ G |
| `vertical_5` | คอลัมน์ O |
| `diagonal_1` | เส้นทแยงมุม \ |
| `diagonal_2` | เส้นทแยงมุม / |
| `four_corners` | 4 มุม |
| `full_card` | เต็มการ์ด |

---

#### Table: `game_participants`

**วัตถุประสงค์**: ผู้เข้าร่วมเกมแต่ละรอบ

```sql
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

  -- Status
  is_spectator BOOLEAN DEFAULT false,
  cards_bought INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,

  -- Timestamps
  joined_at TIMESTAMP DEFAULT NOW()
);
```

**Query ตัวอย่าง:**
```sql
-- ดูว่ามีคนเล่นกี่คนในเกมนี้
SELECT COUNT(*) FROM game_participants
WHERE game_id = 'xxx' AND is_spectator = false;
```

---

#### Table: `cards`

**วัตถุประสงค์**: การ์ดบิงโก

```sql
CREATE TABLE cards (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

  -- Card Data
  numbers INT[][] NOT NULL, -- [[1,16,31,46,61],[2,17,32,47,62],...] (5x5)
  card_hash VARCHAR(64) NOT NULL, -- SHA256(numbers + game_id + created_at)

  -- State
  marked_positions JSONB DEFAULT '[]', -- [{row: 0, col: 1}, {row: 1, col: 2}, ...]
  is_winner BOOLEAN DEFAULT false,

  -- Purchase
  purchase_price DECIMAL(10, 2) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Card Generation (75-Ball Bingo):**

```
  B     I     N     G     O
  1-15  16-30 31-45 46-60 61-75

[[ 1,  16,  31,  46,  61],
 [ 5,  20,  FREE, 50,  65],  ← FREE Space (2,2)
 [ 10, 25,  40,  55,  70],
 [ 12, 28,  38,  58,  72],
 [ 15, 30,  45,  60,  75]]
```

**Card Hash:**
```typescript
// Prevent Card Tampering
const cardHash = SHA256(
  JSON.stringify(numbers) +
  game_id +
  created_at.toISOString()
);
```

---

#### Table: `bingo_requests`

**วัตถุประสงค์**: Anti-Cheat Audit Trail (บันทึกทุกครั้งที่กด Bingo)

```sql
CREATE TABLE bingo_requests (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,

  -- Claim
  claimed_pattern VARCHAR(50) NOT NULL,

  -- Validation Result
  is_valid BOOLEAN NOT NULL,
  validation_result JSONB,
  -- {
  --   reason: 'invalid_pattern',
  --   details: { missing_positions: [...] }
  -- }

  -- Anti-Cheat Timing
  balls_when_requested INT, -- จำนวนลูกตอนกด Bingo
  request_latency_ms INT, -- เวลาจาก ball drawn → bingo request

  -- Result
  is_winner BOOLEAN DEFAULT false,
  winner_rank INT, -- 1 = First, 2 = Second (ถ้ากดพร้อมกัน)

  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  server_timestamp TIMESTAMP DEFAULT NOW() -- Server Time (Authority!)
);
```

**Validation Result Examples:**

```json
// Valid Bingo
{
  "is_valid": true,
  "pattern_matched": "horizontal_1",
  "balls_required": 12,
  "verification_time_ms": 3
}

// Invalid Bingo
{
  "is_valid": false,
  "reason": "invalid_pattern",
  "details": {
    "missing_positions": [[0, 2], [0, 4]],
    "required_positions": [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    "marked_positions": [[0, 0], [0, 1], [0, 3]]
  }
}
```

**Anti-Cheat Detection:**

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
```

---

### 3.4 Support Tables

#### Table: `bot_configs`

**วัตถุประสงค์**: การตั้งค่า Ghost Bot (AI Players)

```sql
CREATE TABLE bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Constraints (ป้องกัน Bot โกง)
  max_cards_per_game INT DEFAULT 2,
  max_win_rate_percent DECIMAL(5, 2) DEFAULT 30.00, -- ห้ามชนะเกิน 30%
  max_consecutive_wins INT DEFAULT 2, -- ห้ามชนะติดต่อกันเกิน 2 รอบ

  -- Delays (ทำให้ดูเหมือนคนจริง)
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
```

**Bot Behavior Rules:**

```typescript
// ตัวอย่าง Bot Logic
if (bot.total_wins / bot.total_games_played > 0.30) {
  // Win Rate > 30% → ลด Aggression
  skipBingoChance = 0.5; // พลาด Bingo 50%
}

if (bot.consecutive_wins >= 2) {
  // ชนะติดต่อกัน 2 รอบ → ต้องแพ้รอบนี้
  skipBingo = true;
}
```

---

#### Table: `chat_messages`

**วัตถุประสงค์**: ข้อความแชทในห้อง

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Message
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'sticker', 'system'
  content TEXT NOT NULL,
  metadata JSONB, -- { sticker_id: 'happy_bingo' }

  -- Moderation
  is_deleted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.5 System Tables

#### Table: `audit_logs`

**วัตถุประสงค์**: บันทึกการตรวจสอบทุกการกระทำสำคัญ

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Actor (ผู้กระทำ)
  user_id UUID REFERENCES users(id),
  user_role user_role,

  -- Action
  action VARCHAR(100) NOT NULL, -- 'login', 'buy_card', 'approve_withdraw', etc.
  entity_type VARCHAR(50), -- 'user', 'transaction', 'game', etc.
  entity_id UUID,

  -- Details
  old_value JSONB, -- ค่าเก่า (ก่อนเปลี่ยน)
  new_value JSONB, -- ค่าใหม่ (หลังเปลี่ยน)
  metadata JSONB, -- ข้อมูลเพิ่มเติม

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);
```

**ตัวอย่าง Audit Log:**

```json
{
  "id": "log_123",
  "user_id": "admin_456",
  "user_role": "admin",
  "action": "approve_withdraw",
  "entity_type": "transaction",
  "entity_id": "txn_789",
  "old_value": {
    "status": "pending"
  },
  "new_value": {
    "status": "completed",
    "approved_by": "admin_456",
    "approved_at": "2026-01-12T10:30:00Z"
  },
  "metadata": {
    "amount": 500.00,
    "user_id": "user_101",
    "notes": "Verified bank transfer"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2026-01-12T10:30:01Z"
}
```

**Audit Actions:**

| Action | Description |
|--------|-------------|
| `login` | เข้าสู่ระบบ |
| `logout` | ออกจากระบบ |
| `buy_card` | ซื้อการ์ด |
| `claim_bingo` | กด Bingo |
| `deposit_request` | ขอเติมเงิน |
| `withdraw_request` | ขอถอนเงิน |
| `approve_deposit` | อนุมัติเติมเงิน (Admin) |
| `approve_withdraw` | อนุมัติถอนเงิน (Admin) |
| `reject_transaction` | ปฏิเสธธุรกรรม (Admin) |
| `ban_user` | แบนผู้ใช้ (Admin) |
| `update_room_config` | เปลี่ยนค่าห้อง (Admin) |

---

#### Table: `system_settings`

**วัตถุประสงค์**: การตั้งค่าระบบ (Admin Config)

```sql
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Default Settings:**

```sql
INSERT INTO system_settings (key, value, description) VALUES
  ('default_fee_percentage', '10.00', 'Default room fee percentage'),
  ('max_withdraw_per_day', '50000.00', 'Maximum withdrawal per day per user'),
  ('min_withdraw_amount', '100.00', 'Minimum withdrawal amount'),
  ('max_deposit_per_day', '100000.00', 'Maximum deposit per day per user'),
  ('rate_limit_bingo_per_minute', '10', 'Max bingo requests per minute per user'),
  ('rate_limit_buy_card_per_minute', '20', 'Max card purchases per minute'),
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('bot_enabled', 'true', 'Enable ghost bots'),
  ('bot_min_players_trigger', '3', 'Minimum players before bot joins');
```

---

## 4. Indexes & Performance

### 4.1 Primary Indexes

```sql
-- ==========================================
-- Primary Key Indexes (Auto-created)
-- ==========================================

-- users(id), transactions(id), rooms(id), games(id), etc.
-- PostgreSQL สร้าง B-tree Index อัตโนมัติสำหรับ PRIMARY KEY
```

### 4.2 Secondary Indexes

```sql
-- ==========================================
-- Users
-- ==========================================
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ==========================================
-- Sessions
-- ==========================================
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ==========================================
-- Transactions (สำคัญมาก!)
-- ==========================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ==========================================
-- Rooms
-- ==========================================
CREATE INDEX idx_rooms_is_active ON rooms(is_active);
CREATE INDEX idx_rooms_current_state ON rooms(current_state);
CREATE INDEX idx_rooms_creator_id ON rooms(creator_id);

-- ==========================================
-- Games
-- ==========================================
CREATE INDEX idx_games_room_id ON games(room_id);
CREATE INDEX idx_games_state ON games(state);
CREATE INDEX idx_games_winner_id ON games(winner_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- ==========================================
-- Game Participants
-- ==========================================
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_user_id ON game_participants(user_id);

-- ==========================================
-- Cards
-- ==========================================
CREATE INDEX idx_cards_game_id ON cards(game_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_card_hash ON cards(card_hash);

-- ==========================================
-- Bingo Requests (Anti-Cheat)
-- ==========================================
CREATE INDEX idx_bingo_requests_game_id ON bingo_requests(game_id);
CREATE INDEX idx_bingo_requests_user_id ON bingo_requests(user_id);
CREATE INDEX idx_bingo_requests_server_timestamp ON bingo_requests(server_timestamp);

-- ==========================================
-- Audit Logs
-- ==========================================
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==========================================
-- Chat Messages
-- ==========================================
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ==========================================
-- Bot Configs
-- ==========================================
CREATE INDEX idx_bot_configs_bot_user_id ON bot_configs(bot_user_id);
CREATE INDEX idx_bot_configs_is_active ON bot_configs(is_active);
```

### 4.3 Composite Indexes (สำหรับ Query ที่ใช้บ่อย)

```sql
-- ==========================================
-- Composite Indexes (Multi-Column)
-- ==========================================

-- Query: Get user's pending transactions
CREATE INDEX idx_transactions_user_status_created
  ON transactions(user_id, status, created_at DESC);

-- Query: Get active games in room
CREATE INDEX idx_games_room_state_created
  ON games(room_id, state, created_at DESC);

-- Query: Get user's cards in game
CREATE INDEX idx_cards_user_game
  ON cards(user_id, game_id);

-- Query: Get valid bingo requests in game
CREATE INDEX idx_bingo_requests_game_valid
  ON bingo_requests(game_id, is_valid, server_timestamp);
```

### 4.4 Partial Indexes (เฉพาะข้อมูลที่ใช้บ่อย)

```sql
-- ==========================================
-- Partial Indexes (WHERE clause)
-- ==========================================

-- เฉพาะ Transactions ที่ Pending (Admin Dashboard)
CREATE INDEX idx_transactions_pending
  ON transactions(created_at DESC)
  WHERE status = 'pending';

-- เฉพาะ Active Players (ไม่รวม Bot และคนโดน Ban)
CREATE INDEX idx_users_active_players
  ON users(created_at DESC)
  WHERE role = 'player' AND is_banned = false;

-- เฉพาะ Active Rooms
CREATE INDEX idx_rooms_active
  ON rooms(current_state, created_at DESC)
  WHERE is_active = true;

-- เฉพาะ Running Games
CREATE INDEX idx_games_running
  ON games(room_id, created_at DESC)
  WHERE state = 'running';
```

### 4.5 Full-Text Search Indexes

```sql
-- ==========================================
-- Full-Text Search (GIN Index)
-- ==========================================

-- Search Room Name
CREATE INDEX idx_rooms_name_fulltext
  ON rooms USING gin(to_tsvector('english', name));

-- ตัวอย่าง Query:
-- SELECT * FROM rooms
-- WHERE to_tsvector('english', name) @@ to_tsquery('english', 'VIP');
```

---

## 5. Constraints & Business Rules

### 5.1 Foreign Key Constraints

```sql
-- ==========================================
-- Foreign Key Strategies
-- ==========================================

-- ON DELETE CASCADE: ลบตาม Parent
ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ON DELETE RESTRICT: ห้ามลบถ้ามี Child
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- ON DELETE SET NULL: Set NULL เมื่อลบ
ALTER TABLE chat_messages
  ADD CONSTRAINT fk_chat_messages_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

### 5.2 Check Constraints

```sql
-- ==========================================
-- Business Rule Constraints
-- ==========================================

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

-- Max Players 2-20
ALTER TABLE rooms
  ADD CONSTRAINT check_max_players_range
  CHECK (max_players BETWEEN 2 AND 20);

-- Card Price > 0
ALTER TABLE rooms
  ADD CONSTRAINT check_card_price_positive
  CHECK (card_price > 0);

-- Bot Win Rate 0-100%
ALTER TABLE bot_configs
  ADD CONSTRAINT check_bot_win_rate
  CHECK (max_win_rate_percent BETWEEN 0 AND 100);
```

### 5.3 Unique Constraints

```sql
-- ==========================================
-- Unique Constraints
-- ==========================================

-- ห้าม Google ID ซ้ำ
ALTER TABLE users ADD CONSTRAINT unique_google_id UNIQUE (google_id);

-- ห้าม Email ซ้ำ
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- ห้าม Card Hash ซ้ำ (ป้องกันการปลอม)
ALTER TABLE cards ADD CONSTRAINT unique_card_hash UNIQUE (card_hash);
```

---

## 6. Transaction Patterns

### 6.1 Buy Card Transaction (ACID)

```sql
-- ==========================================
-- ตัวอย่าง: ซื้อการ์ด 2 ใบ @ 100 Point
-- ==========================================

BEGIN;

-- 1. Lock User Row (FOR UPDATE)
SELECT point_balance
FROM users
WHERE id = 'user_123'
FOR UPDATE;

-- 2. Check Balance
-- IF balance < 200 THEN ROLLBACK

-- 3. Deduct Balance
UPDATE users
SET
  point_balance = point_balance - 200,
  total_spent = total_spent + 200,
  updated_at = NOW()
WHERE id = 'user_123';

-- 4. Create Transaction Record
INSERT INTO transactions (
  user_id, type, amount, status,
  balance_before, balance_after, metadata
) VALUES (
  'user_123', 'card_purchase', 200.00, 'completed',
  1500.00, 1300.00,
  '{"game_id": "game_789", "card_ids": ["card_1", "card_2"]}'
);

-- 5. Create Cards
INSERT INTO cards (game_id, user_id, numbers, card_hash, purchase_price)
VALUES
  ('game_789', 'user_123', '[[...]]', 'hash_1', 100.00),
  ('game_789', 'user_123', '[[...]]', 'hash_2', 100.00);

-- 6. Update Game Pot
UPDATE games
SET pot_size = pot_size + 200.00
WHERE id = 'game_789';

-- 7. Audit Log
INSERT INTO audit_logs (
  user_id, action, entity_type, entity_id, metadata
) VALUES (
  'user_123', 'buy_card', 'game', 'game_789',
  '{"quantity": 2, "total_cost": 200.00}'
);

COMMIT;
```

### 6.2 Payout Transaction (Winner)

```sql
-- ==========================================
-- ตัวอย่าง: จ่ายเงินรางวัล
-- ==========================================

BEGIN;

-- 1. Calculate Payout
-- Pot = 1000 Point
-- Fee = 10% = 100 Point
-- Winner Gets = 900 Point

-- 2. Update Winner Balance
UPDATE users
SET
  point_balance = point_balance + 900,
  total_wins = total_wins + 1,
  total_won = total_won + 900,
  updated_at = NOW()
WHERE id = 'winner_123'
RETURNING point_balance INTO balance_after;

-- 3. Create Payout Transaction
INSERT INTO transactions (
  user_id, type, amount, status,
  balance_before, balance_after, metadata
) VALUES (
  'winner_123', 'payout', 900.00, 'completed',
  1000.00, 1900.00,
  '{"game_id": "game_789", "pattern": "horizontal_1"}'
);

-- 4. Create Fee Transaction (System Income)
-- (Optional: สร้าง System User ID สำหรับเก็บ Fee)

-- 5. Update Game Record
UPDATE games
SET
  state = 'payout',
  winner_id = 'winner_123',
  payout_amount = 900.00,
  fee_amount = 100.00,
  ended_at = NOW()
WHERE id = 'game_789';

-- 6. Update Room Statistics
UPDATE rooms
SET
  total_pot_collected = total_pot_collected + 1000.00,
  total_fee_collected = total_fee_collected + 100.00,
  top_winner_id = 'winner_123',
  top_winner_amount = 900.00
WHERE id = 'room_101';

-- 7. Audit Log
INSERT INTO audit_logs (
  user_id, action, entity_type, entity_id, metadata
) VALUES (
  'winner_123', 'win_payout', 'game', 'game_789',
  '{"amount": 900.00, "fee": 100.00, "pattern": "horizontal_1"}'
);

COMMIT;
```

### 6.3 Deposit/Withdraw Approval (Admin)

```sql
-- ==========================================
-- Admin อนุมัติการเติมเงิน
-- ==========================================

BEGIN;

-- 1. Update Transaction Status
UPDATE transactions
SET
  status = 'completed',
  approved_by = 'admin_456',
  approved_at = NOW(),
  updated_at = NOW()
WHERE id = 'txn_789' AND status = 'pending'
RETURNING amount, user_id;

-- 2. Update User Balance
UPDATE users
SET
  point_balance = point_balance + 1000.00,
  updated_at = NOW()
WHERE id = 'user_123';

-- 3. Audit Log
INSERT INTO audit_logs (
  user_id, action, entity_type, entity_id,
  old_value, new_value, metadata
) VALUES (
  'admin_456', 'approve_deposit', 'transaction', 'txn_789',
  '{"status": "pending"}',
  '{"status": "completed", "approved_by": "admin_456"}',
  '{"amount": 1000.00, "user_id": "user_123"}'
);

COMMIT;
```

---

## 7. Query Optimization

### 7.1 ตัวอย่าง Optimized Queries

#### Query 1: Get Active Rooms with Player Count

```sql
-- ❌ Slow Query (N+1 Problem)
SELECT * FROM rooms WHERE is_active = true;
-- Then: SELECT COUNT(*) FROM game_participants WHERE game_id = ...

-- ✅ Optimized Query (Single JOIN)
SELECT
  r.id,
  r.name,
  r.current_state,
  r.card_price,
  r.pot_size,
  COUNT(DISTINCT gp.user_id) FILTER (WHERE gp.is_spectator = false) as player_count
FROM rooms r
LEFT JOIN games g ON g.room_id = r.id AND g.state = 'running'
LEFT JOIN game_participants gp ON gp.game_id = g.id
WHERE r.is_active = true
GROUP BY r.id
ORDER BY player_count DESC;
```

#### Query 2: Get User Transaction History with Pagination

```sql
-- ✅ Optimized with Index
SELECT
  id,
  type,
  amount,
  status,
  balance_after,
  created_at
FROM transactions
WHERE user_id = 'user_123'
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Uses Index: idx_transactions_user_status_created
```

#### Query 3: Get Leaderboard (Top Winners)

```sql
-- ✅ Optimized with Partial Index
SELECT
  id,
  display_name,
  avatar_url,
  total_wins,
  total_won
FROM users
WHERE role = 'player' AND is_banned = false
ORDER BY total_won DESC
LIMIT 10;

-- Uses Partial Index: idx_users_active_players
```

#### Query 4: Get Pending Admin Approvals

```sql
-- ✅ Optimized with Partial Index
SELECT
  t.id,
  t.type,
  t.amount,
  t.created_at,
  u.display_name,
  u.email
FROM transactions t
JOIN users u ON u.id = t.user_id
WHERE t.status = 'pending'
  AND t.type IN ('deposit', 'withdraw')
ORDER BY t.created_at ASC;

-- Uses Partial Index: idx_transactions_pending
```

### 7.2 EXPLAIN ANALYZE Examples

```sql
-- ตรวจสอบ Query Performance
EXPLAIN ANALYZE
SELECT * FROM transactions
WHERE user_id = 'user_123'
  AND status = 'pending'
ORDER BY created_at DESC;

-- Expected Output:
-- Index Scan using idx_transactions_user_status_created
-- Planning Time: 0.2 ms
-- Execution Time: 1.5 ms
```

---

## 8. Audit Trail Strategy

### 8.1 การบันทึก Audit Log

```sql
-- ==========================================
-- Trigger: Auto-create Audit Log
-- ==========================================

CREATE OR REPLACE FUNCTION audit_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_value,
      new_value
    ) VALUES (
      NEW.approved_by,
      'update_transaction_status',
      'transaction',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_transaction_changes
AFTER UPDATE ON transactions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION audit_transaction_changes();
```

### 8.2 Audit Query Examples

```sql
-- ดูว่า Admin คนไหนอนุมัติ Transaction อะไรบ้าง
SELECT
  al.created_at,
  u.display_name as admin_name,
  al.action,
  al.old_value->>'status' as old_status,
  al.new_value->>'status' as new_status,
  al.metadata->>'amount' as amount
FROM audit_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action IN ('approve_deposit', 'approve_withdraw')
  AND al.created_at >= NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC;
```

---

## 9. Backup & Recovery

### 9.1 Backup Strategy

```bash
# Daily Full Backup (via Cron)
0 3 * * * pg_dump -U postgres -d bingo_party > /backups/bingo_party_$(date +\%Y\%m\%d).sql

# Weekly Compressed Backup
0 3 * * 0 pg_dump -U postgres -d bingo_party | gzip > /backups/bingo_party_$(date +\%Y\%m\%d).sql.gz

# Backup to S3 (Production)
0 3 * * * pg_dump -U postgres -d bingo_party | aws s3 cp - s3://my-backup/bingo_party_$(date +\%Y\%m\%d).sql
```

### 9.2 Recovery

```bash
# Restore from Backup
psql -U postgres -d bingo_party < /backups/bingo_party_20260112.sql

# Point-in-Time Recovery (ต้อง enable WAL archiving)
# recovery.conf:
# restore_command = 'cp /archive/%f %p'
# recovery_target_time = '2026-01-12 10:30:00'
```

### 9.3 Data Retention Policy

```sql
-- ลบข้อมูลเก่าเพื่อประหยัด Storage

-- ลบ Sessions หมดอายุ (ทุกวัน)
DELETE FROM sessions WHERE expires_at < NOW();

-- ลบ Chat Messages เก่ากว่า 30 วัน
DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '30 days';

-- Archive Audit Logs เก่ากว่า 1 ปี
-- (ย้ายไป Table audit_logs_archive)
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## 10. Migration Strategy

### 10.1 Initial Setup

```bash
# 1. สร้าง Database
createdb -U postgres bingo_party

# 2. Run Migration Script
psql -U postgres -d bingo_party -f schema.sql

# 3. Verify
psql -U postgres -d bingo_party -c "\dt"
```

### 10.2 Schema Version Control

```sql
-- Table: schema_migrations
CREATE TABLE schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  description TEXT,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- Track Migrations
INSERT INTO schema_migrations (version, description)
VALUES ('1.0.0', 'Initial schema');
```

### 10.3 Future Migrations

```sql
-- ตัวอย่าง: Migration 1.1.0 - Add VIP System

-- migrations/1.1.0_add_vip_system.sql
ALTER TABLE users ADD COLUMN is_vip BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN vip_expires_at TIMESTAMP;

CREATE INDEX idx_users_is_vip ON users(is_vip);

INSERT INTO schema_migrations (version, description)
VALUES ('1.1.0', 'Add VIP system');
```

---

## 📊 Summary

### เป้าหมายหลัก

✅ **Transaction Safety** - ใช้ ACID Transaction สำหรับการเงิน
✅ **Audit Trail** - บันทึกทุกการเปลี่ยนแปลงสำคัญ
✅ **Performance** - Indexes ครบถ้วน Query < 100ms
✅ **Scalability** - รองรับข้อมูลเพิ่มขึ้น 10x
✅ **Data Integrity** - Foreign Keys, Constraints ครบถ้วน

### ขั้นตอนถัดไป

1. **Backend Developer** → ใช้ Schema นี้สร้าง ORM Models
2. **QA Engineer** → ทดสอบ Transaction Safety
3. **DevOps** → Setup Backup & Monitoring
4. **DBA** → Monitor Performance & Optimize

---

**เอกสารนี้จัดทำโดย**: เม (Database Administrator) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: Ready for Implementation ✅
