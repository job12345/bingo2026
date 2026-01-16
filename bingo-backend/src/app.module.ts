import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { RoomsModule } from './rooms/rooms.module';
import { GameModule } from './game/game.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AdminModule } from './admin/admin.module';
import { BotModule } from './bot/bot.module';
import { TelegramModule } from './common/telegram/telegram.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ReferralModule } from './referral/referral.module';
import { TournamentModule } from './tournament/tournament.module';
import { PayoutModule } from './payout/payout.module';
import { DepositModule } from './deposit/deposit.module';
import { VipModule } from './vip/vip.module';
import { FraudModule } from './fraud/fraud.module';
import { StreamingModule } from './streaming/streaming.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Bull Queue (Redis)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Database (Prisma)
    PrismaModule,

    // Common Modules (Global)
    SettingsModule,
    TelegramModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    WalletModule,
    RoomsModule,
    GameModule,
    WebsocketModule,
    AdminModule,
    BotModule,
    HealthModule,
    LeaderboardModule,
    ReferralModule,
    TournamentModule,
    PayoutModule,
    DepositModule,
    VipModule,
    FraudModule,
    StreamingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
