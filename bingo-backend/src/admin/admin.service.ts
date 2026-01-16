import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../common/telegram/telegram.service';
import { UpdateTelegramSettingsDto } from './dto/telegram-settings.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) { }

  // ===========================================
  // OAuth Settings
  // ===========================================

  /**
   * ดึงการตั้งค่า OAuth ปัจจุบัน
   */
  async getOAuthSettings() {
    const [clientIdSetting, clientSecretSetting] = await Promise.all([
      this.prisma.systemSetting.findUnique({
        where: { key: 'google_client_id' },
      }),
      this.prisma.systemSetting.findUnique({
        where: { key: 'google_client_secret' },
      }),
    ]);

    // ถ้าไม่มีใน database ให้ใช้จาก env
    const clientId = clientIdSetting?.value
      ? String(clientIdSetting.value)
      : this.configService.get('GOOGLE_CLIENT_ID') || '';

    const clientSecret = clientSecretSetting?.value
      ? String(clientSecretSetting.value)
      : this.configService.get('GOOGLE_CLIENT_SECRET') || '';

    return {
      clientId: clientId ? clientId.slice(0, 20) + '...' : null, // ซ่อนบางส่วน
      clientSecret: clientSecret ? '****' + clientSecret.slice(-6) : null, // แสดงเฉพาะ 6 ตัวท้าย
      lastUpdated: clientIdSetting?.updatedAt || clientSecretSetting?.updatedAt,
      configured: !!clientId && !!clientSecret,
    };
  }

  /**
   * อัปเดตการตั้งค่า OAuth
   */
  async updateOAuthSettings(
    adminId: string,
    dto: { clientId?: string; clientSecret?: string },
  ) {
    const updates = [];

    // อัปเดต Client ID
    if (dto.clientId) {
      await this.prisma.systemSetting.upsert({
        where: { key: 'google_client_id' },
        update: {
          value: dto.clientId,
          updatedBy: adminId,
        },
        create: {
          key: 'google_client_id',
          value: dto.clientId,
          description: 'Google OAuth Client ID',
          updatedBy: adminId,
        },
      });
      updates.push('Client ID');
      this.logger.log('✅ Google Client ID updated');
    }

    // อัปเดต Client Secret
    if (dto.clientSecret) {
      await this.prisma.systemSetting.upsert({
        where: { key: 'google_client_secret' },
        update: {
          value: dto.clientSecret,
          updatedBy: adminId,
        },
        create: {
          key: 'google_client_secret',
          value: dto.clientSecret,
          description: 'Google OAuth Client Secret',
          updatedBy: adminId,
        },
      });
      updates.push('Client Secret');
      this.logger.log('✅ Google Client Secret updated');
    }

    // TODO: ในอนาคตอาจต้องอัปเดต .env file หรือ restart service
    // เนื่องจาก GoogleStrategy โหลด config ตอน bootstrap

    return {
      message: 'อัปเดตการตั้งค่า OAuth สำเร็จ (จะมีผลหลัง restart server)',
      updated: updates,
    };
  }

  /**
   * ทดสอบเชื่อมต่อ OAuth
   */
  async testOAuthConnection() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return {
        success: false,
        message: 'ยังไม่ได้ตั้งค่า Google OAuth Client ID/Secret',
      };
    }

    // Check if client ID format is valid
    if (!clientId.includes('.apps.googleusercontent.com')) {
      return {
        success: false,
        message: 'Client ID รูปแบบไม่ถูกต้อง (ต้องลงท้ายด้วย .apps.googleusercontent.com)',
      };
    }

    // ตรวจสอบว่าค่าเป็นที่ถูกต้อง (basic validation)
    if (clientId.startsWith('y') || clientId.length < 50) {
      return {
        success: false,
        message: 'Client ID อาจไม่ถูกต้อง กรุณาตรวจสอบจาก Google Cloud Console',
      };
    }

    return {
      success: true,
      message: 'การตั้งค่า OAuth ดูถูกต้อง',
      clientId: clientId.slice(0, 20) + '...',
    };
  }

  // ===========================================
  // Telegram Settings
  // ===========================================

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

