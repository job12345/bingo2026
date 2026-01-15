-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('player', 'admin', 'bot');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdraw', 'card_purchase', 'payout', 'refund', 'fee');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "GameState" AS ENUM ('idle', 'waiting', 'sitting', 'buying', 'running', 'bingo_race', 'winner_declared', 'payout', 'cooldown');

-- CreateEnum
CREATE TYPE "DrawMode" AS ENUM ('auto', 'manual_rotate');

-- CreateEnum
CREATE TYPE "BallSet" AS ENUM ('75', '90');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone_number" VARCHAR(15),
    "password" TEXT,
    "google_id" TEXT,
    "email" TEXT,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'player',
    "point_balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "bank_name" TEXT,
    "bank_account_number" TEXT,
    "bank_account_name" TEXT,
    "total_games_played" INTEGER NOT NULL DEFAULT 0,
    "total_wins" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_won" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_reason" TEXT,
    "banned_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "device_info" JSONB,
    "ip_address" INET,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "balance_before" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "payment_slip_url" TEXT,
    "bank_transfer_id" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "metadata" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "creator_id" UUID,
    "draw_mode" "DrawMode" NOT NULL DEFAULT 'auto',
    "ball_set" "BallSet" NOT NULL DEFAULT '75',
    "max_players" INTEGER NOT NULL DEFAULT 10,
    "max_rounds" INTEGER NOT NULL DEFAULT 50,
    "card_price" DECIMAL(10,2) NOT NULL,
    "max_cards_per_player" INTEGER NOT NULL DEFAULT 4,
    "fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "current_round" INTEGER NOT NULL DEFAULT 0,
    "total_rounds_played" INTEGER NOT NULL DEFAULT 0,
    "total_pot_collected" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_fee_collected" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "top_winner_id" UUID,
    "top_winner_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "current_state" "GameState" NOT NULL DEFAULT 'idle',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "round_number" INTEGER NOT NULL,
    "state" "GameState" NOT NULL DEFAULT 'waiting',
    "drawn_numbers" INTEGER[],
    "current_ball" INTEGER,
    "total_balls_drawn" INTEGER NOT NULL DEFAULT 0,
    "pot_size" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "fee_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "payout_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "winner_id" UUID,
    "winner_card_id" UUID,
    "winning_pattern" TEXT,
    "balls_to_win" INTEGER,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_spectator" BOOLEAN NOT NULL DEFAULT false,
    "cards_bought" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "numbers" JSONB NOT NULL,
    "card_hash" TEXT NOT NULL,
    "marked_positions" JSONB NOT NULL DEFAULT '[]',
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "purchase_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bingo_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "claimed_pattern" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL,
    "validation_result" JSONB,
    "balls_when_requested" INTEGER,
    "request_latency_ms" INTEGER,
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "winner_rank" INTEGER,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "server_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bingo_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bot_user_id" UUID NOT NULL,
    "max_cards_per_game" INTEGER NOT NULL DEFAULT 2,
    "max_win_rate_percent" DECIMAL(5,2) NOT NULL DEFAULT 30.00,
    "max_consecutive_wins" INTEGER NOT NULL DEFAULT 2,
    "min_delay_ms" INTEGER NOT NULL DEFAULT 500,
    "max_delay_ms" INTEGER NOT NULL DEFAULT 2000,
    "daily_budget" DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    "current_daily_spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_games_played" INTEGER NOT NULL DEFAULT 0,
    "total_wins" INTEGER NOT NULL DEFAULT 0,
    "total_losses" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "user_id" UUID,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "user_role" "UserRole",
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "old_value" JSONB,
    "new_value" JSONB,
    "metadata" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "schema_migrations" (
    "version" TEXT NOT NULL,
    "description" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_google_id_idx" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at" DESC);

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_idx" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "transactions_user_id_status_created_at_idx" ON "transactions"("user_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "rooms_is_active_idx" ON "rooms"("is_active");

-- CreateIndex
CREATE INDEX "rooms_current_state_idx" ON "rooms"("current_state");

-- CreateIndex
CREATE INDEX "rooms_creator_id_idx" ON "rooms"("creator_id");

-- CreateIndex
CREATE INDEX "games_room_id_idx" ON "games"("room_id");

-- CreateIndex
CREATE INDEX "games_state_idx" ON "games"("state");

-- CreateIndex
CREATE INDEX "games_winner_id_idx" ON "games"("winner_id");

-- CreateIndex
CREATE INDEX "games_created_at_idx" ON "games"("created_at" DESC);

-- CreateIndex
CREATE INDEX "games_room_id_state_created_at_idx" ON "games"("room_id", "state", "created_at" DESC);

-- CreateIndex
CREATE INDEX "game_participants_game_id_idx" ON "game_participants"("game_id");

-- CreateIndex
CREATE INDEX "game_participants_user_id_idx" ON "game_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_participants_game_id_user_id_key" ON "game_participants"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cards_card_hash_key" ON "cards"("card_hash");

-- CreateIndex
CREATE INDEX "cards_game_id_idx" ON "cards"("game_id");

-- CreateIndex
CREATE INDEX "cards_user_id_idx" ON "cards"("user_id");

-- CreateIndex
CREATE INDEX "cards_card_hash_idx" ON "cards"("card_hash");

-- CreateIndex
CREATE INDEX "cards_user_id_game_id_idx" ON "cards"("user_id", "game_id");

-- CreateIndex
CREATE INDEX "bingo_requests_game_id_idx" ON "bingo_requests"("game_id");

-- CreateIndex
CREATE INDEX "bingo_requests_user_id_idx" ON "bingo_requests"("user_id");

-- CreateIndex
CREATE INDEX "bingo_requests_server_timestamp_idx" ON "bingo_requests"("server_timestamp");

-- CreateIndex
CREATE INDEX "bingo_requests_game_id_is_valid_server_timestamp_idx" ON "bingo_requests"("game_id", "is_valid", "server_timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "bot_configs_bot_user_id_key" ON "bot_configs"("bot_user_id");

-- CreateIndex
CREATE INDEX "bot_configs_bot_user_id_idx" ON "bot_configs"("bot_user_id");

-- CreateIndex
CREATE INDEX "bot_configs_is_active_idx" ON "bot_configs"("is_active");

-- CreateIndex
CREATE INDEX "chat_messages_room_id_idx" ON "chat_messages"("room_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_top_winner_id_fkey" FOREIGN KEY ("top_winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_requests" ADD CONSTRAINT "bingo_requests_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_requests" ADD CONSTRAINT "bingo_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_requests" ADD CONSTRAINT "bingo_requests_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_configs" ADD CONSTRAINT "bot_configs_bot_user_id_fkey" FOREIGN KEY ("bot_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

