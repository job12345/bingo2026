import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../common/telegram/telegram.service';
import { UpdateTelegramSettingsDto } from './dto/telegram-settings.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * อัปเดตการตั้งค่า Telegram
   */
  async updateTelegramSettings(
    adminId: string,
    dto: UpdateTelegramSettingsDto,
  ) {
    const updates = [];

    // อัปเดต Bot Token (ถ้ามี)
    if (dto.botToken) {
      await this.prisma.systemSetting.upsert({
        where: { key: 'telegram_bot_token' },
        update: {
          value: dto.botToken,
          updatedBy: adminId,
        },
        create: {
          key: 'telegram_bot_token',
          value: dto.botToken,
          description: 'Telegram Bot Token for notifications',
          updatedBy: adminId,
        },
      });
      updates.push('Bot Token');
      this.logger.log('✅ Telegram Bot Token updated');
    }

    // อัปเดต Chat ID (ถ้ามี)
    if (dto.chatId) {
      await this.prisma.systemSetting.upsert({
        where: { key: 'telegram_chat_id' },
        update: {
          value: dto.chatId,
          updatedBy: adminId,
        },
        create: {
          key: 'telegram_chat_id',
          value: dto.chatId,
          description: 'Telegram Chat ID for receiving notifications',
          updatedBy: adminId,
        },
      });
      updates.push('Chat ID');
      this.logger.log('✅ Telegram Chat ID updated');
    }

    // รีเฟรช Bot Configuration
    await this.telegramService.refreshBot();

    return {
      message: 'อัปเดตการตั้งค่า Telegram สำเร็จ',
      updated: updates,
    };
  }

  /**
   * ดึงการตั้งค่า Telegram ปัจจุบัน
   */
  async getTelegramSettings() {
    const [botTokenSetting, chatIdSetting] = await Promise.all([
      this.prisma.systemSetting.findUnique({
        where: { key: 'telegram_bot_token' },
      }),
      this.prisma.systemSetting.findUnique({
        where: { key: 'telegram_chat_id' },
      }),
    ]);

    return {
      botToken: botTokenSetting?.value
        ? '****' + String(botTokenSetting.value).slice(-6)
        : null, // แสดงเฉพาะ 6 ตัวท้าย
      chatId: chatIdSetting?.value || null,
      lastUpdated: botTokenSetting?.updatedAt || chatIdSetting?.updatedAt,
    };
  }

  /**
   * ทดสอบส่งข้อความ Telegram
   */
  async testTelegramNotification(chatId?: string) {
    const sent = await this.telegramService.testSendMessage(chatId || '');

    if (sent) {
      return {
        success: true,
        message: 'ส่งข้อความทดสอบสำเร็จ',
      };
    } else {
      return {
        success: false,
        message: 'ส่งข้อความทดสอบไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า',
      };
    }
  }
}
