import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram.service';

/**
 * Telegram Module
 * - Global Module สำหรับส่งการแจ้งเตือนผ่าน Telegram
 * - ใช้งานได้ทุก Module โดยไม่ต้อง Import ซ้ำ
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
