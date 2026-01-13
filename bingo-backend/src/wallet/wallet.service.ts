import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { DepositRequestDto } from './dto/deposit-request.dto';
import { WithdrawRequestDto } from './dto/withdraw-request.dto';
import { TelegramService } from '../common/telegram/telegram.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * ดูยอดเงิน Point ปัจจุบัน
   */
  async getBalance(userId: string): Promise<{ balance: Decimal }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointBalance: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { balance: user.pointBalance };
  }

  /**
   * ดูประวัติธุรกรรม
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          balanceBefore: true,
          balanceAfter: true,
          metadata: true,
          createdAt: true,
        },
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * ขอเติมเงิน (Deposit Request)
   * Status: pending → รอ Admin อนุมัติ
   */
  async requestDeposit(userId: string, dto: DepositRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointBalance: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ตรวจสอบ Limit วันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDeposits = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'deposit',
        status: { in: ['pending', 'completed'] },
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    const maxDepositPerDay = parseFloat(process.env.MAX_DEPOSIT_PER_DAY || '100000');
    const todayTotal = Number(todayDeposits._sum.amount || 0);

    if (todayTotal + dto.amount > maxDepositPerDay) {
      throw new BadRequestException(
        `เกิน Limit การเติมเงินต่อวัน (${maxDepositPerDay} บาท/วัน)`,
      );
    }

    // สร้าง Transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'deposit',
        amount: dto.amount,
        status: 'pending',
        balanceBefore: user.pointBalance,
        balanceAfter: user.pointBalance, // ยังไม่เปลี่ยน (รอ Admin)
        paymentSlipUrl: dto.paymentSlipUrl,
        notes: dto.notes,
      },
    });

    // ส่งการแจ้งเตือนผ่าน Telegram (ไม่ให้ระบบหลักล่มถ้าส่งไม่ได้)
    this.telegramService
      .sendDepositNotification(transaction)
      .catch((error) => console.error('Failed to send Telegram notification:', error));

    return {
      message: 'คำขอเติมเงินถูกส่งแล้ว รอ Admin อนุมัติ',
      transaction,
    };
  }

  /**
   * ขอถอนเงิน (Withdraw Request)
   * Status: pending → รอ Admin อนุมัติ
   */
  async requestWithdraw(userId: string, dto: WithdrawRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointBalance: true, bankName: true, bankAccountNumber: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ตรวจสอบข้อมูลบัญชีธนาคาร
    if (!user.bankName || !user.bankAccountNumber) {
      throw new BadRequestException('กรุณากรอกข้อมูลบัญชีธนาคารก่อนถอนเงิน');
    }

    // ตรวจสอบยอดเงินพอหรือไม่
    if (Number(user.pointBalance) < dto.amount) {
      throw new BadRequestException('ยอดเงินไม่เพียงพอ');
    }

    // ตรวจสอบ Minimum Withdraw
    const minWithdraw = parseFloat(process.env.MIN_WITHDRAW_AMOUNT || '100');
    if (dto.amount < minWithdraw) {
      throw new BadRequestException(`จำนวนเงินขั้นต่ำ ${minWithdraw} บาท`);
    }

    // ตรวจสอบ Limit วันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWithdraws = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'withdraw',
        status: { in: ['pending', 'completed'] },
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    const maxWithdrawPerDay = parseFloat(process.env.MAX_WITHDRAW_PER_DAY || '50000');
    const todayTotal = Number(todayWithdraws._sum.amount || 0);

    if (todayTotal + dto.amount > maxWithdrawPerDay) {
      throw new BadRequestException(
        `เกิน Limit การถอนเงินต่อวัน (${maxWithdrawPerDay} บาท/วัน)`,
      );
    }

    // Lock เงินไว้ (หักออกจากยอด)
    const transaction = await this.prisma.$transaction(async (prisma) => {
      // หักยอดเงินทันที (Lock)
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { pointBalance: { decrement: dto.amount } },
      });

      // สร้าง Transaction
      return prisma.transaction.create({
        data: {
          userId,
          type: 'withdraw',
          amount: dto.amount,
          status: 'pending',
          balanceBefore: user.pointBalance,
          balanceAfter: updatedUser.pointBalance,
          notes: dto.notes,
        },
      });
    });

    // ส่งการแจ้งเตือนผ่าน Telegram (ไม่ให้ระบบหลักล่มถ้าส่งไม่ได้)
    this.telegramService
      .sendWithdrawNotification(transaction)
      .catch((error) => console.error('Failed to send Telegram notification:', error));

    return {
      message: 'คำขอถอนเงินถูกส่งแล้ว เงินถูก Lock ไว้ รอ Admin โอนเงิน',
      transaction,
    };
  }

  /**
   * ดูรายการรอ Admin อนุมัติ (สำหรับ User)
   */
  async getPendingRequests(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'pending',
        type: { in: ['deposit', 'withdraw'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ยกเลิกคำขอ (เฉพาะ Pending)
   */
  async cancelRequest(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (transaction.status !== 'pending') {
      throw new BadRequestException('สามารถยกเลิกได้เฉพาะรายการที่รอดำเนินการเท่านั้น');
    }

    // ถ้าเป็น Withdraw ต้องคืนเงิน
    if (transaction.type === 'withdraw') {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { pointBalance: { increment: transaction.amount } },
        }),
        this.prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'cancelled' },
        }),
      ]);
    } else {
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'cancelled' },
      });
    }

    return { message: 'ยกเลิกคำขอเรียบร้อยแล้ว' };
  }

  /**
   * ดูสรุปการเงิน
   */
  async getFinancialSummary(userId: string) {
    const [totalDeposit, totalWithdraw, totalSpent, totalWon] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, type: 'deposit', status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'withdraw', status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'card_purchase', status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'payout', status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointBalance: true },
    });

    return {
      currentBalance: user?.pointBalance || 0,
      totalDeposit: totalDeposit._sum.amount || 0,
      totalWithdraw: totalWithdraw._sum.amount || 0,
      totalSpent: totalSpent._sum.amount || 0,
      totalWon: totalWon._sum.amount || 0,
      netProfit: Number(totalWon._sum.amount || 0) - Number(totalSpent._sum.amount || 0),
    };
  }
}
