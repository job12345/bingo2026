import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositMethod, DepositStatus, TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Bank configuration - will be configurable via env
const BANK_CONFIG = {
    bankName: process.env.DEPOSIT_BANK_NAME || 'กสิกรไทย',
    accountNumber: process.env.DEPOSIT_BANK_ACCOUNT || '123-4-56789-0',
    accountName: process.env.DEPOSIT_BANK_ACCOUNT_NAME || 'Bingo Party',
};

const PROMPTPAY_NUMBER = process.env.PROMPTPAY_NUMBER || '0812345678';

// Crypto config
const CRYPTO_CONFIG: Record<string, { address: string; currencies: string[] }> = {
    BSC: {
        address: process.env.CRYPTO_BSC_ADDRESS || '0x...',
        currencies: ['USDT', 'BNB'],
    },
};

const DEPOSIT_EXPIRY_MINUTES = 15;

@Injectable()
export class DepositService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create Bank Transfer deposit request
     * สุ่มเลขสตางค์ เช่น 500 → 500.01, 500.23
     */
    async createBankTransferDeposit(userId: string, amount: number) {
        if (amount < 20) {
            throw new BadRequestException('ยอดฝากขั้นต่ำ 20 บาท');
        }

        // Generate random satang (0.01 - 0.99)
        const randomSatang = Math.floor(Math.random() * 99) + 1;
        const actualAmount = new Decimal(amount).add(new Decimal(randomSatang).div(100));
        const bankRef = actualAmount.toFixed(2);

        const expiresAt = new Date(Date.now() + DEPOSIT_EXPIRY_MINUTES * 60 * 1000);

        const deposit = await this.prisma.depositRequest.create({
            data: {
                userId,
                method: DepositMethod.bank_transfer,
                requestedAmount: new Decimal(amount),
                actualAmount,
                bankRef,
                targetBank: BANK_CONFIG.bankName,
                targetAccount: BANK_CONFIG.accountNumber,
                expiresAt,
            },
        });

        return {
            id: deposit.id,
            method: 'bank_transfer',
            requestedAmount: amount,
            actualAmount: Number(actualAmount),
            bankRef,
            targetBank: BANK_CONFIG.bankName,
            targetAccount: BANK_CONFIG.accountNumber,
            accountName: BANK_CONFIG.accountName,
            expiresAt,
            message: `โอนเงิน ${bankRef} บาท ไปยังบัญชี ${BANK_CONFIG.bankName} ${BANK_CONFIG.accountNumber}`,
        };
    }

    /**
     * Create Crypto deposit request
     * Auto-approve when blockchain confirms
     */
    async createCryptoDeposit(userId: string, amount: number, network: string, currency: string) {
        if (amount < 20) {
            throw new BadRequestException('ยอดฝากขั้นต่ำ 20 บาท');
        }

        const networkConfig = CRYPTO_CONFIG[network];
        if (!networkConfig) {
            throw new BadRequestException('ไม่รองรับ network นี้');
        }

        if (!networkConfig.currencies.includes(currency)) {
            throw new BadRequestException(`ไม่รองรับ ${currency} บน ${network}`);
        }

        const deposit = await this.prisma.depositRequest.create({
            data: {
                userId,
                method: DepositMethod.crypto,
                requestedAmount: new Decimal(amount),
                actualAmount: new Decimal(amount),
                cryptoNetwork: network,
                cryptoAddress: networkConfig.address,
                cryptoCurrency: currency,
            },
        });

        return {
            id: deposit.id,
            method: 'crypto',
            requestedAmount: amount,
            network,
            currency,
            address: networkConfig.address,
            message: `ส่ง ${amount} ${currency} ไปยัง ${networkConfig.address} (${network})`,
        };
    }

    /**
     * Create PromptPay deposit request
     */
    async createPromptPayDeposit(userId: string, amount: number) {
        if (amount < 20) {
            throw new BadRequestException('ยอดฝากขั้นต่ำ 20 บาท');
        }

        // Generate random satang for uniqueness
        const randomSatang = Math.floor(Math.random() * 99) + 1;
        const actualAmount = new Decimal(amount).add(new Decimal(randomSatang).div(100));

        const expiresAt = new Date(Date.now() + DEPOSIT_EXPIRY_MINUTES * 60 * 1000);

        const deposit = await this.prisma.depositRequest.create({
            data: {
                userId,
                method: DepositMethod.promptpay,
                requestedAmount: new Decimal(amount),
                actualAmount,
                promptPayQR: PROMPTPAY_NUMBER,
                expiresAt,
            },
        });

        return {
            id: deposit.id,
            method: 'promptpay',
            requestedAmount: amount,
            actualAmount: Number(actualAmount),
            promptPayNumber: PROMPTPAY_NUMBER,
            expiresAt,
            message: `โอนเงิน ${actualAmount.toFixed(2)} บาท ผ่าน PromptPay ${PROMPTPAY_NUMBER}`,
        };
    }

    /**
     * Get user's deposit history
     */
    async getDepositHistory(userId: string) {
        return this.prisma.depositRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    /**
     * Get pending deposits (Admin)
     */
    async getPendingDeposits() {
        return this.prisma.depositRequest.findMany({
            where: { status: DepositStatus.pending },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Approve deposit and add points (Admin)
     */
    async approveDeposit(depositId: string, adminId: string) {
        const deposit = await this.prisma.depositRequest.findUnique({
            where: { id: depositId },
        });

        if (!deposit) {
            throw new NotFoundException('ไม่พบรายการฝากเงิน');
        }

        if (deposit.status !== DepositStatus.pending) {
            throw new BadRequestException('รายการนี้ถูกดำเนินการแล้ว');
        }

        // Update deposit and add points
        await this.prisma.$transaction(async (tx) => {
            // Update deposit status
            await tx.depositRequest.update({
                where: { id: depositId },
                data: {
                    status: DepositStatus.confirmed,
                    confirmedAt: new Date(),
                    approvedBy: adminId,
                },
            });

            // Get user current balance
            const user = await tx.user.findUnique({
                where: { id: deposit.userId },
                select: { pointBalance: true },
            });

            const balanceBefore = new Decimal(user!.pointBalance);
            const depositAmount = new Decimal(deposit.requestedAmount); // Use requested, not actual
            const balanceAfter = balanceBefore.add(depositAmount);

            // Update user balance
            await tx.user.update({
                where: { id: deposit.userId },
                data: { pointBalance: balanceAfter },
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: deposit.userId,
                    type: TransactionType.deposit,
                    amount: depositAmount,
                    status: TransactionStatus.completed,
                    balanceBefore,
                    balanceAfter,
                    metadata: {
                        depositId,
                        method: deposit.method,
                        actualAmount: deposit.actualAmount.toString(),
                    },
                    notes: `ฝากเงินผ่าน ${deposit.method}`,
                },
            });
        });

        return { message: 'อนุมัติการฝากเงินสำเร็จ' };
    }

    /**
     * Reject deposit (Admin)
     */
    async rejectDeposit(depositId: string, adminId: string, reason: string) {
        const deposit = await this.prisma.depositRequest.findUnique({
            where: { id: depositId },
        });

        if (!deposit) {
            throw new NotFoundException('ไม่พบรายการฝากเงิน');
        }

        if (deposit.status !== DepositStatus.pending) {
            throw new BadRequestException('รายการนี้ถูกดำเนินการแล้ว');
        }

        await this.prisma.depositRequest.update({
            where: { id: depositId },
            data: {
                status: DepositStatus.rejected,
                approvedBy: adminId,
                notes: reason,
            },
        });

        return { message: 'ปฏิเสธการฝากเงินแล้ว' };
    }

    /**
     * Confirm crypto deposit (called by blockchain webhook)
     */
    async confirmCryptoDeposit(depositId: string, txHash: string) {
        const deposit = await this.prisma.depositRequest.findUnique({
            where: { id: depositId },
        });

        if (!deposit) {
            throw new NotFoundException('ไม่พบรายการฝากเงิน');
        }

        if (deposit.method !== DepositMethod.crypto) {
            throw new BadRequestException('รายการนี้ไม่ใช่การฝาก crypto');
        }

        if (deposit.status !== DepositStatus.pending) {
            return { message: 'รายการนี้ถูกดำเนินการแล้ว' };
        }

        // Auto-approve crypto deposits
        await this.prisma.$transaction(async (tx) => {
            await tx.depositRequest.update({
                where: { id: depositId },
                data: {
                    status: DepositStatus.confirmed,
                    confirmedAt: new Date(),
                    cryptoTxHash: txHash,
                },
            });

            const user = await tx.user.findUnique({
                where: { id: deposit.userId },
                select: { pointBalance: true },
            });

            const balanceBefore = new Decimal(user!.pointBalance);
            const depositAmount = new Decimal(deposit.requestedAmount);
            const balanceAfter = balanceBefore.add(depositAmount);

            await tx.user.update({
                where: { id: deposit.userId },
                data: { pointBalance: balanceAfter },
            });

            await tx.transaction.create({
                data: {
                    userId: deposit.userId,
                    type: TransactionType.deposit,
                    amount: depositAmount,
                    status: TransactionStatus.completed,
                    balanceBefore,
                    balanceAfter,
                    metadata: {
                        depositId,
                        method: 'crypto',
                        txHash,
                        network: deposit.cryptoNetwork,
                        currency: deposit.cryptoCurrency,
                    },
                    notes: `ฝากเงินผ่าน ${deposit.cryptoCurrency} (${deposit.cryptoNetwork})`,
                },
            });
        });

        return { message: 'ฝากเงิน crypto สำเร็จ' };
    }

    /**
     * Get deposit config for frontend
     */
    getDepositConfig() {
        return {
            minAmount: 20,
            methods: {
                bank_transfer: {
                    bankName: BANK_CONFIG.bankName,
                    accountNumber: BANK_CONFIG.accountNumber,
                    accountName: BANK_CONFIG.accountName,
                },
                crypto: {
                    networks: Object.keys(CRYPTO_CONFIG),
                    currencies: CRYPTO_CONFIG.BSC?.currencies || [],
                },
                promptpay: {
                    number: PROMPTPAY_NUMBER,
                },
            },
        };
    }
}
