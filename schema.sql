-- ==========================================
-- Bingo Party Enterprise - Database Schema
-- PostgreSQL 16
-- ==========================================
-- Database Administrator: เม
-- วันที่จัดทำ: 12 มกราคม 2026
-- เวอร์ชัน: 1.0
-- ==========================================

-- ==========================================
-- 1. ENUMS (Custom Types)
-- ==========================================

CREATE TYPE user_role AS ENUM ('player', 'admin', 'bot');

CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'withdraw',
  'card_purchase',
  'payout',
  'refund',
  'fee'
);

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'rejected',
  'cancelled'
);

CREATE TYPE game_state AS ENUM (
  'idle',
  'waiting',
  'sitting',
  'buying',
  'running',
  'bingo_race',
  'winner_declared',
  'payout',
  'cooldown'
);

CREATE TYPE draw_mode AS ENUM (
  'auto',
  'manual_rotate'
);

CREATE TYPE ball_set AS ENUM (
  '75',
  '90'
);

-- ==========================================
-- 2. EXTENSIONS
-- ==========================================

-- UUID Generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-Text Search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- 3. TABLES
-- ==========================================

-- ------------------------------------------
-- 3.1 Users & Authentication
-- ------------------------------------------

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

COMMENT ON TABLE users IS 'ผู้ใช้งานทั้งหมด (Player, Admin, Bot)';
COMMENT ON COLUMN users.point_balance IS '1 Point = 1 บาท (ต้องไม่ติดลบ)';

-- ------------------------------------------
-- 3.2 Sessions
-- ------------------------------------------

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

COMMENT ON TABLE sessions IS 'Session และ Refresh Token';

-- ------------------------------------------
-- 3.3 Transactions (Financial Audit Trail)
-- ------------------------------------------

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

COMMENT ON TABLE transactions IS 'ธุรกรรมการเงินทั้งหมด (Audit Trail)';
COMMENT ON COLUMN transactions.balance_before IS 'ยอดเงินก่อนทำ Transaction';
COMMENT ON COLUMN transactions.balance_after IS 'ยอดเงินหลังทำ Transaction';

-- ------------------------------------------
-- 3.4 Rooms (ห้องเกม)
-- ------------------------------------------

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

COMMENT ON TABLE rooms IS 'ห้องเกมบิงโก';
COMMENT ON COLUMN rooms.fee_percentage IS 'ค่าธรรมเนียม % (ระบบหัก)';

-- ------------------------------------------
-- 3.5 Games (รอบเกม)
-- ------------------------------------------

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

COMMENT ON TABLE games IS 'รอบเกมบิงโก';
COMMENT ON COLUMN games.drawn_numbers IS 'Array ของเลขที่ออกแล้ว';

-- ------------------------------------------
-- 3.6 Game Participants (ผู้เข้าร่วมเกม)
-- ------------------------------------------

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

COMMENT ON TABLE game_participants IS 'ผู้เข้าร่วมเกมแต่ละรอบ';

-- ------------------------------------------
-- 3.7 Cards (การ์ดบิงโก)
-- ------------------------------------------

CREATE TABLE cards (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

  -- Card Data
  numbers INT[][] NOT NULL, -- [[1,16,31,46,61],[2,17,32,47,62],...] (5x5)
  card_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 hash

  -- State
  marked_positions JSONB DEFAULT '[]', -- [{row: 0, col: 1}, ...]
  is_winner BOOLEAN DEFAULT false,

  -- Purchase
  purchase_price DECIMAL(10, 2) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE cards IS 'การ์ดบิงโก';
COMMENT ON COLUMN cards.card_hash IS 'SHA256(numbers + game_id + created_at) - ป้องกันการปลอม';

-- ------------------------------------------
-- 3.8 Bingo Requests (Anti-Cheat Audit)
-- ------------------------------------------

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

COMMENT ON TABLE bingo_requests IS 'บันทึกทุกครั้งที่กด Bingo (Anti-Cheat)';
COMMENT ON COLUMN bingo_requests.server_timestamp IS 'Server Timestamp (Authority)';

-- ------------------------------------------
-- 3.9 Bot Configurations (Ghost Bot)
-- ------------------------------------------

CREATE TABLE bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Constraints (ป้องกัน Bot โกง)
  max_cards_per_game INT DEFAULT 2,
  max_win_rate_percent DECIMAL(5, 2) DEFAULT 30.00 CHECK (max_win_rate_percent BETWEEN 0 AND 100),
  max_consecutive_wins INT DEFAULT 2,

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

COMMENT ON TABLE bot_configs IS 'การตั้งค่า Ghost Bot (AI Players)';
COMMENT ON COLUMN bot_configs.max_win_rate_percent IS 'ห้ามชนะเกิน % นี้';

-- ------------------------------------------
-- 3.10 Chat Messages
-- ------------------------------------------

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

COMMENT ON TABLE chat_messages IS 'ข้อความแชทในห้อง';

-- ------------------------------------------
-- 3.11 Audit Logs (Security & Compliance)
-- ------------------------------------------

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

COMMENT ON TABLE audit_logs IS 'บันทึกการตรวจสอบทุกการกระทำสำคัญ';

-- ------------------------------------------
-- 3.12 System Settings (Admin Config)
-- ------------------------------------------

CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE system_settings IS 'การตั้งค่าระบบ';

-- ==========================================
-- 4. INDEXES
-- ==========================================

-- ------------------------------------------
-- 4.1 Users
-- ------------------------------------------

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Partial Index: Active Players
CREATE INDEX idx_users_active_players
  ON users(created_at DESC)
  WHERE role = 'player' AND is_banned = false;

-- ------------------------------------------
-- 4.2 Sessions
-- ------------------------------------------

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ------------------------------------------
-- 4.3 Transactions
-- ------------------------------------------

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Composite Index
CREATE INDEX idx_transactions_user_status_created
  ON transactions(user_id, status, created_at DESC);

-- Partial Index: Pending Transactions
CREATE INDEX idx_transactions_pending
  ON transactions(created_at DESC)
  WHERE status = 'pending';

-- ------------------------------------------
-- 4.4 Rooms
-- ------------------------------------------

CREATE INDEX idx_rooms_is_active ON rooms(is_active);
CREATE INDEX idx_rooms_current_state ON rooms(current_state);
CREATE INDEX idx_rooms_creator_id ON rooms(creator_id);

-- Partial Index: Active Rooms
CREATE INDEX idx_rooms_active
  ON rooms(current_state, created_at DESC)
  WHERE is_active = true;

-- Full-Text Search: Room Name
CREATE INDEX idx_rooms_name_fulltext
  ON rooms USING gin(to_tsvector('english', name));

-- ------------------------------------------
-- 4.5 Games
-- ------------------------------------------

CREATE INDEX idx_games_room_id ON games(room_id);
CREATE INDEX idx_games_state ON games(state);
CREATE INDEX idx_games_winner_id ON games(winner_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- Composite Index
CREATE INDEX idx_games_room_state_created
  ON games(room_id, state, created_at DESC);

-- Partial Index: Running Games
CREATE INDEX idx_games_running
  ON games(room_id, created_at DESC)
  WHERE state = 'running';

-- ------------------------------------------
-- 4.6 Game Participants
-- ------------------------------------------

CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_user_id ON game_participants(user_id);

-- ------------------------------------------
-- 4.7 Cards
-- ------------------------------------------

CREATE INDEX idx_cards_game_id ON cards(game_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_card_hash ON cards(card_hash);

-- Composite Index
CREATE INDEX idx_cards_user_game ON cards(user_id, game_id);

-- ------------------------------------------
-- 4.8 Bingo Requests
-- ------------------------------------------

CREATE INDEX idx_bingo_requests_game_id ON bingo_requests(game_id);
CREATE INDEX idx_bingo_requests_user_id ON bingo_requests(user_id);
CREATE INDEX idx_bingo_requests_server_timestamp ON bingo_requests(server_timestamp);

-- Composite Index
CREATE INDEX idx_bingo_requests_game_valid
  ON bingo_requests(game_id, is_valid, server_timestamp);

-- ------------------------------------------
-- 4.9 Bot Configs
-- ------------------------------------------

CREATE INDEX idx_bot_configs_bot_user_id ON bot_configs(bot_user_id);
CREATE INDEX idx_bot_configs_is_active ON bot_configs(is_active);

-- ------------------------------------------
-- 4.10 Chat Messages
-- ------------------------------------------

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ------------------------------------------
-- 4.11 Audit Logs
-- ------------------------------------------

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

-- ------------------------------------------
-- 5.1 Auto-update updated_at
-- ------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bot_configs_updated_at
  BEFORE UPDATE ON bot_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------
-- 5.2 Audit Log for Transaction Changes
-- ------------------------------------------

CREATE OR REPLACE FUNCTION audit_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
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
  EXECUTE FUNCTION audit_transaction_changes();

-- ==========================================
-- 6. DEFAULT DATA
-- ==========================================

-- ------------------------------------------
-- 6.1 System Settings
-- ------------------------------------------

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

-- ==========================================
-- 7. SCHEMA VERSION TRACKING
-- ==========================================

CREATE TABLE schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  description TEXT,
  applied_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_migrations (version, description)
VALUES ('1.0.0', 'Initial schema - Full system setup');

-- ==========================================
-- 8. VIEWS (Helpful Queries)
-- ==========================================

-- ------------------------------------------
-- 8.1 View: Active Rooms with Player Count
-- ------------------------------------------

CREATE OR REPLACE VIEW v_active_rooms AS
SELECT
  r.id,
  r.name,
  r.current_state,
  r.card_price,
  r.fee_percentage,
  r.max_players,
  r.current_round,
  r.total_rounds_played,
  COALESCE(g.pot_size, 0) as current_pot,
  COUNT(DISTINCT gp.user_id) FILTER (WHERE gp.is_spectator = false) as current_players
FROM rooms r
LEFT JOIN games g ON g.room_id = r.id AND g.state IN ('waiting', 'sitting', 'buying', 'running')
LEFT JOIN game_participants gp ON gp.game_id = g.id
WHERE r.is_active = true
GROUP BY r.id, g.pot_size
ORDER BY current_players DESC;

COMMENT ON VIEW v_active_rooms IS 'ห้องที่เปิดใช้งานพร้อมจำนวนผู้เล่น';

-- ------------------------------------------
-- 8.2 View: Pending Admin Approvals
-- ------------------------------------------

CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT
  t.id,
  t.type,
  t.amount,
  t.created_at,
  u.id as user_id,
  u.display_name,
  u.email,
  t.payment_slip_url,
  t.metadata
FROM transactions t
JOIN users u ON u.id = t.user_id
WHERE t.status = 'pending'
  AND t.type IN ('deposit', 'withdraw')
ORDER BY t.created_at ASC;

COMMENT ON VIEW v_pending_approvals IS 'รายการรอ Admin อนุมัติ';

-- ------------------------------------------
-- 8.3 View: User Leaderboard
-- ------------------------------------------

CREATE OR REPLACE VIEW v_leaderboard AS
SELECT
  id,
  display_name,
  avatar_url,
  total_games_played,
  total_wins,
  total_won,
  CASE
    WHEN total_games_played > 0
    THEN ROUND((total_wins::DECIMAL / total_games_played) * 100, 2)
    ELSE 0
  END as win_rate_percent
FROM users
WHERE role = 'player' AND is_banned = false
ORDER BY total_won DESC
LIMIT 100;

COMMENT ON VIEW v_leaderboard IS 'Leaderboard ผู้เล่นที่ชนะมากที่สุด';

-- ==========================================
-- 9. FUNCTIONS (Helper Functions)
-- ==========================================

-- ------------------------------------------
-- 9.1 Function: Get User Balance
-- ------------------------------------------

CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS DECIMAL(12, 2) AS $$
BEGIN
  RETURN (SELECT point_balance FROM users WHERE id = p_user_id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_balance IS 'ดูยอดเงิน Point ของผู้ใช้';

-- ------------------------------------------
-- 9.2 Function: Check User Can Afford
-- ------------------------------------------

CREATE OR REPLACE FUNCTION can_afford(p_user_id UUID, p_amount DECIMAL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT point_balance >= p_amount FROM users WHERE id = p_user_id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_afford IS 'ตรวจสอบว่าผู้ใช้มีเงินพอหรือไม่';

-- ------------------------------------------
-- 9.3 Function: Clean Expired Sessions
-- ------------------------------------------

CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clean_expired_sessions IS 'ลบ Session หมดอายุ (Run Daily)';

-- ==========================================
-- 10. GRANTS (Permissions)
-- ==========================================

-- สร้าง Role สำหรับ Application
-- CREATE ROLE bingo_app WITH LOGIN PASSWORD 'your_password_here';

-- Grant Permissions
-- GRANT CONNECT ON DATABASE bingo_party TO bingo_app;
-- GRANT USAGE ON SCHEMA public TO bingo_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bingo_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bingo_app;

-- ==========================================
-- END OF SCHEMA
-- ==========================================

-- Verify Installation
SELECT
  'Schema installed successfully!' as status,
  COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- List All Tables
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
