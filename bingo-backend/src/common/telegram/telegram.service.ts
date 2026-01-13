import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from '../../prisma/prisma.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;
  private defaultChatId: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initializeBot();
  }

  /**
   * เริ่มต้น Telegram Bot
   */
  private async initializeBot() {
    try {
      // ดึงค่าจาก Environment Variable หรือ Database
      const botToken = await this.getTelegramBotToken();
      const chatId = await this.getTelegramChatId();

      if (botToken) {
        this.bot = new TelegramBot(botToken, { polling: false });
        this.defaultChatId = chatId;
        this.logger.log('✅ Telegram Bot initialized successfully');
      } else {
        this.logger.warn('⚠️ Telegram Bot Token not configured');
      }
    } catch (error) {
      this.logger.error('❌ Failed to initialize Telegram Bot', error);
    }
  }

  /**
   * ดึง Bot Token จาก Database หรือ Environment Variable
   */
  private async getTelegramBotToken(): Promise<string | null> {
    try {
      // ลองดึงจาก Database ก่อน
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: 'telegram_bot_token' },
      });

      if (setting && setting.value) {
        return setting.value as string;
      }

      // ถ้าไม่มีใน Database ให้ใช้จาก Environment Variable
      return this.configService.get<string>('TELEGRAM_BOT_TOKEN') || null;
    } catch (error) {
      this.logger.error('Error fetching Telegram Bot Token', error);
      return this.configService.get<string>('TELEGRAM_BOT_TOKEN') || null;
    }
  }

  /**
   * ดึง Chat ID จาก Database หรือ Environment Variable
   */
  private async getTelegramChatId(): Promise<string | null> {
    try {
      // ลองดึงจาก Database ก่อน
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: 'telegram_chat_id' },
      });

      if (setting && setting.value) {
        return setting.value as string;
      }

      // ถ้าไม่มีใน Database ให้ใช้จาก Environment Variable
      return this.configService.get<string>('TELEGRAM_CHAT_ID') || null;
    } catch (error) {
      this.logger.error('Error fetching Telegram Chat ID', error);
      return this.configService.get<string>('TELEGRAM_CHAT_ID') || null;
    }
  }

  /**
   * รีเฟรช Bot (เมื่อมีการเปลี่ยน Settings)
   */
  async refreshBot() {
    this.logger.log('🔄 Refreshing Telegram Bot configuration...');
    await this.initializeBot();
  }

  /**
   * ส่งข้อความทั่วไป
   */
  async sendMessage(chatId: string | null, message: string): Promise<boolean> {
    try {
      if (!this.bot) {
        this.logger.warn('⚠️ Telegram Bot is not configured. Skipping notification.');
        return false;
      }

      const targetChatId = chatId || this.defaultChatId;

      if (!targetChatId) {
        this.logger.warn('⚠️ No Chat ID provided. Skipping notification.');
        return false;
      }

      await this.bot.sendMessage(targetChatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });

      this.logger.log(`✅ Telegram message sent to ${targetChatId}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send Telegram message', error);
      return false;
    }
  }

  /**
   * แจ้งเตือนเมื่อมีคำขอเติมเงิน (Deposit)
   */
  async sendDepositNotification(transaction: Transaction): Promise<boolean> {
    try {
      // ดึงข้อมูล User
      const user = await this.prisma.user.findUnique({
        where: { id: transaction.userId },
        select: {
          email: true,
          displayName: true,
        },
      });

      if (!user) {
        this.logger.error('User not found for transaction', transaction.id);
        return false;
      }

      // สร้างข้อความแจ้งเตือน
      const message = this.formatDepositMessage(transaction, user);

      // ส่งข้อความ
      const sent = await this.sendMessage(null, message);

      // บันทึก Log
      if (sent) {
        this.logger.log(`📨 Deposit notification sent for transaction ${transaction.id}`);
      }

      return sent;
    } catch (error) {
      this.logger.error('❌ Failed to send deposit notification', error);
      return false;
    }
  }

  /**
   * แจ้งเตือนเมื่อมีคำขอถอนเงิน (Withdraw)
   */
  async sendWithdrawNotification(transaction: Transaction): Promise<boolean> {
    try {
      // ดึงข้อมูล User
      const user = await this.prisma.user.findUnique({
        where: { id: transaction.userId },
        select: {
          email: true,
          displayName: true,
          bankName: true,
          bankAccountNumber: true,
          bankAccountName: true,
        },
      });

      if (!user) {
        this.logger.error('User not found for transaction', transaction.id);
        return false;
      }

      // สร้างข้อความแจ้งเตือน
      const message = this.formatWithdrawMessage(transaction, user);

      // ส่งข้อความ
      const sent = await this.sendMessage(null, message);

      // บันทึก Log
      if (sent) {
        this.logger.log(`📨 Withdraw notification sent for transaction ${transaction.id}`);
      }

      return sent;
    } catch (error) {
      this.logger.error('❌ Failed to send withdraw notification', error);
      return false;
    }
  }

  /**
   * แจ้งเตือนเมื่อ Admin อนุมัติ/ปฏิเสธ
   */
  async sendTransactionStatusNotification(
    transaction: Transaction,
    status: 'approved' | 'rejected',
  ): Promise<boolean> {
    try {
      // ดึงข้อมูล User
      const user = await this.prisma.user.findUnique({
        where: { id: transaction.userId },
        select: {
          email: true,
          displayName: true,
        },
      });

      if (!user) {
        this.logger.error('User not found for transaction', transaction.id);
        return false;
      }

      // ดึงข้อมูล Admin (ถ้ามี)
      let adminName = 'Admin';
      if (transaction.approvedBy) {
        const admin = await this.prisma.user.findUnique({
          where: { id: transaction.approvedBy },
          select: { displayName: true },
        });
        if (admin) {
          adminName = admin.displayName;
        }
      }

      // สร้างข้อความแจ้งเตือน
      const message = this.formatStatusMessage(transaction, user, status, adminName);

      // ส่งข้อความ
      const sent = await this.sendMessage(null, message);

      // บันทึก Log
      if (sent) {
        this.logger.log(`📨 Status notification sent for transaction ${transaction.id}`);
      }

      return sent;
    } catch (error) {
      this.logger.error('❌ Failed to send status notification', error);
      return false;
    }
  }

  /**
   * จัดรูปแบบข้อความ Deposit
   */
  private formatDepositMessage(transaction: any, user: any): string {
    const amount = Number(transaction.amount).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const date = new Date(transaction.createdAt).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
💰 <b>การฝากเงินใหม่</b>

👤 <b>ผู้ใช้:</b> ${user.displayName}
📧 <b>อีเมล:</b> ${user.email}
💵 <b>จำนวน:</b> ${amount} บาท
🕒 <b>เวลา:</b> ${date}
📊 <b>สถานะ:</b> รอตรวจสอบ

${transaction.paymentSlipUrl ? '📎 <b>สลิป:</b> ' + transaction.paymentSlipUrl : ''}
${transaction.notes ? '📝 <b>หมายเหตุ:</b> ' + transaction.notes : ''}

👉 <b>ตรวจสอบที่ Admin Panel</b>
Transaction ID: <code>${transaction.id}</code>
    `.trim();
  }

  /**
   * จัดรูปแบบข้อความ Withdraw
   */
  private formatWithdrawMessage(transaction: any, user: any): string {
    const amount = Number(transaction.amount).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const date = new Date(transaction.createdAt).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
💸 <b>คำขอถอนเงินใหม่</b>

👤 <b>ผู้ใช้:</b> ${user.displayName}
📧 <b>อีเมล:</b> ${user.email}
💵 <b>จำนวน:</b> ${amount} บาท
🕒 <b>เวลา:</b> ${date}
📊 <b>สถานะ:</b> รอโอนเงิน

🏦 <b>ข้อมูลบัญชี:</b>
  ธนาคาร: ${user.bankName || '-'}
  เลขบัญชี: ${user.bankAccountNumber || '-'}
  ชื่อบัญชี: ${user.bankAccountName || '-'}

${transaction.notes ? '📝 <b>หมายเหตุ:</b> ' + transaction.notes : ''}

👉 <b>ดำเนินการที่ Admin Panel</b>
Transaction ID: <code>${transaction.id}</code>
    `.trim();
  }

  /**
   * จัดรูปแบบข้อความ Status Update
   */
  private formatStatusMessage(
    transaction: any,
    user: any,
    status: 'approved' | 'rejected',
    adminName: string,
  ): string {
    const amount = Number(transaction.amount).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const date = new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusIcon = status === 'approved' ? '✅' : '❌';
    const statusText = status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ';
    const transactionType = transaction.type === 'deposit' ? 'การฝากเงิน' : 'การถอนเงิน';

    return `
${statusIcon} <b>${transactionType}${statusText}</b>

👤 <b>ผู้ใช้:</b> ${user.displayName}
📧 <b>อีเมล:</b> ${user.email}
💵 <b>จำนวน:</b> ${amount} บาท
🕒 <b>เวลา:</b> ${date}
👨‍💼 <b>ดำเนินการโดย:</b> ${adminName}

${transaction.rejectionReason ? '❗ <b>เหตุผล:</b> ' + transaction.rejectionReason : ''}

Transaction ID: <code>${transaction.id}</code>
    `.trim();
  }

  /**
   * ทดสอบส่งข้อความ
   */
  async testSendMessage(chatId: string): Promise<boolean> {
    const message = `
🔔 <b>Telegram Notification Test</b>

✅ การเชื่อมต่อ Telegram Bot สำเร็จ!

เวลา: ${new Date().toLocaleString('th-TH')}

🎮 <b>Bingo Party Enterprise</b>
    `.trim();

    return this.sendMessage(chatId, message);
  }
}
