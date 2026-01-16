import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Payout configurations
const MIN_PAYOUT_AMOUNT = 100; // Minimum 100 Points
const PAYOUT_FEE_PERCENT = 2; // 2% fee

export interface PayoutRequest {
    userId: string;
    amount: number;
    bankAccount?: string;
    bankName?: string;
    promptPayNumber?: string;
    method: 'bank' | 'promptpay';
}

@Injectable()
export class PayoutService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Request manual payout
     */
    async requestPayout(request: PayoutRequest) {
        const { userId, amount, method } = request;

        if (amount < MIN_PAYOUT_AMOUNT) {
            throw new BadRequestException(`จำนวนถอนขั้นต่ำ ${MIN_PAYOUT_AMOUNT} Points`);
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                pointBalance: true,
                bankAccountNumber: true,
                bankName: true,
                phoneNumber: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const balance = new Decimal(user.pointBalance);
        const payoutAmount = new Decimal(amount);
        const fee = payoutAmount.mul(PAYOUT_FEE_PERCENT).div(100);
        const netAmount = payoutAmount.sub(fee);

        if (balance.lt(payoutAmount)) {
            throw new BadRequestException('ยอดเงินไม่เพียงพอ');
        }

        // Validate payout method
        if (method === 'bank') {
            const bankAccount = request.bankAccount || user.bankAccountNumber;
            const bankName = request.bankName || user.bankName;
            if (!bankAccount || !bankName) {
                throw new BadRequestException('กรุณาเพิ่มข้อมูลบัญชีธนาคารก่อนถอนเงิน');
            }
        } else if (method === 'promptpay') {
            const promptPay = request.promptPayNumber || user.phoneNumber;
            if (!promptPay) {
                throw new BadRequestException('กรุณาเพิ่มเลขพร้อมเพย์ก่อนถอนเงิน');
            }
        }

        // Create payout transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const balanceBefore = balance;
            const balanceAfter = balance.sub(payoutAmount);

            // Deduct from user balance
            await tx.user.update({
                where: { id: userId },
                data: { pointBalance: balanceAfter },
            });

            // Create withdrawal transaction (pending)
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    type: TransactionType.withdraw,
                    amount: payoutAmount,
                    status: TransactionStatus.pending,
                    balanceBefore,
                    balanceAfter,
                    metadata: {
                        method,
                        fee: fee.toString(),
                        netAmount: netAmount.toString(),
                        ...(method === 'bank'
                            ? { bankAccount: request.bankAccount, bankName: request.bankName }
                            : { promptPayNumber: request.promptPayNumber }),
                    },
                    notes: `ถอนเงิน ${payoutAmount} Points (ค่าธรรมเนียม ${fee} Points)`,
                },
            });

            return {
                transactionId: transaction.id,
                amount: payoutAmount,
                fee,
                netAmount,
                status: 'pending',
                newBalance: balanceAfter,
            };
        });

        return result;
    }

    /**
     * Get pending payouts (Admin)
     */
    async getPendingPayouts() {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                type: TransactionType.withdraw,
                status: TransactionStatus.pending,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        bankAccountNumber: true,
                        bankName: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return transactions;
    }

    /**
     * Approve payout (Admin)
     */
    async approvePayout(transactionId: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        if (transaction.status !== TransactionStatus.pending) {
            throw new BadRequestException('Transaction is not pending');
        }

        await this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: TransactionStatus.completed,
            },
        });

        return { message: 'Payout approved' };
    }

    /**
     * Reject payout and refund (Admin)
     */
    async rejectPayout(transactionId: string, reason: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        if (transaction.status !== TransactionStatus.pending) {
            throw new BadRequestException('Transaction is not pending');
        }

        // Refund the amount
        await this.prisma.$transaction(async (tx) => {
            // Get current balance
            const user = await tx.user.findUnique({
                where: { id: transaction.userId },
                select: { pointBalance: true },
            });

            const currentBalance = new Decimal(user!.pointBalance);
            const refundAmount = new Decimal(transaction.amount);
            const newBalance = currentBalance.add(refundAmount);

            // Refund to user
            await tx.user.update({
                where: { id: transaction.userId },
                data: { pointBalance: newBalance },
            });

            // Update transaction status
            await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    status: TransactionStatus.rejected,
                    metadata: {
                        ...(transaction.metadata as object),
                        rejectionReason: reason,
                        refunded: true,
                    },
                },
            });

            // Create refund transaction
            await tx.transaction.create({
                data: {
                    userId: transaction.userId,
                    type: TransactionType.deposit,
                    amount: refundAmount,
                    status: TransactionStatus.completed,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    metadata: { type: 'payout_refund', originalTransactionId: transactionId },
                    notes: `คืนเงิน - ${reason}`,
                },
            });
        });

        return { message: 'Payout rejected and refunded' };
    }

    /**
     * Get user's payout history
     */
    async getPayoutHistory(userId: string) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                type: TransactionType.withdraw,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return transactions;
    }

    /**
     * Get payout settings
     */
    getPayoutSettings() {
        return {
            minAmount: MIN_PAYOUT_AMOUNT,
            feePercent: PAYOUT_FEE_PERCENT,
            methods: ['bank', 'promptpay'],
        };
    }
}
