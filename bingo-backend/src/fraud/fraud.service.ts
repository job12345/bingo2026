import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FraudAlertType, FraudAlertStatus } from '@prisma/client';
import { TelegramService } from '../common/telegram/telegram.service';
import { Decimal } from '@prisma/client/runtime/library';

// Fraud detection thresholds
const THRESHOLDS = {
    rapidDeposits: {
        count: 5,      // More than 5 deposits
        timeWindow: 60, // in 60 minutes
    },
    unusualWithdrawal: {
        ratio: 0.8, // Withdraw more than 80% of balance
    },
    suspiciousBetting: {
        winRate: 0.9, // Win rate higher than 90%
        minGames: 10, // With at least 10 games
    },
    multipleAccounts: {
        sameIp: 3, // More than 3 accounts from same IP
    },
};

@Injectable()
export class FraudService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly telegram: TelegramService,
    ) { }

    /**
     * Check for rapid deposits (money laundering indicator)
     */
    async checkRapidDeposits(userId: string): Promise<boolean> {
        const timeWindowAgo = new Date(
            Date.now() - THRESHOLDS.rapidDeposits.timeWindow * 60 * 1000,
        );

        const recentDeposits = await this.prisma.depositRequest.count({
            where: {
                userId,
                status: 'confirmed',
                createdAt: { gte: timeWindowAgo },
            },
        });

        if (recentDeposits > THRESHOLDS.rapidDeposits.count) {
            await this.createAlert({
                userId,
                type: FraudAlertType.rapid_deposits,
                severity: 3,
                description: `ฝากเงินบ่อยผิดปกติ: ${recentDeposits} ครั้งใน ${THRESHOLDS.rapidDeposits.timeWindow} นาที`,
                metadata: { depositCount: recentDeposits, timeWindow: THRESHOLDS.rapidDeposits.timeWindow },
            });
            return true;
        }
        return false;
    }

    /**
     * Check for unusual withdrawal (might be hacked account)
     */
    async checkUnusualWithdrawal(userId: string, amount: number): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { pointBalance: true },
        });

        if (!user) return false;

        const balance = Number(user.pointBalance);
        const ratio = amount / (balance + amount);

        if (ratio > THRESHOLDS.unusualWithdrawal.ratio && amount > 1000) {
            await this.createAlert({
                userId,
                type: FraudAlertType.unusual_withdrawal,
                severity: 4,
                description: `ถอนเงินผิดปกติ: ${amount} Points (${(ratio * 100).toFixed(0)}% ของยอดคงเหลือ)`,
                metadata: { amount, balance, ratio },
            });
            return true;
        }
        return false;
    }

    /**
     * Check for suspicious win rate
     */
    async checkSuspiciousBetting(userId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { totalGamesPlayed: true, totalWins: true },
        });

        if (!user || user.totalGamesPlayed < THRESHOLDS.suspiciousBetting.minGames) {
            return false;
        }

        const winRate = user.totalWins / user.totalGamesPlayed;

        if (winRate > THRESHOLDS.suspiciousBetting.winRate) {
            await this.createAlert({
                userId,
                type: FraudAlertType.suspicious_betting,
                severity: 5,
                description: `อัตราชนะสูงผิดปกติ: ${(winRate * 100).toFixed(1)}% (${user.totalWins}/${user.totalGamesPlayed})`,
                metadata: { winRate, totalGames: user.totalGamesPlayed, totalWins: user.totalWins },
            });
            return true;
        }
        return false;
    }

    /**
     * Check for multiple accounts from same IP
     */
    async checkMultipleAccounts(ipAddress: string, userId: string): Promise<boolean> {
        const accountsFromIp = await this.prisma.session.findMany({
            where: {
                ipAddress,
                userId: { not: userId },
            },
            select: { userId: true },
            distinct: ['userId'],
        });

        if (accountsFromIp.length >= THRESHOLDS.multipleAccounts.sameIp) {
            await this.createAlert({
                userId,
                type: FraudAlertType.multiple_accounts,
                severity: 3,
                description: `พบหลายบัญชีจาก IP เดียวกัน: ${accountsFromIp.length + 1} บัญชี`,
                metadata: { ipAddress, accountCount: accountsFromIp.length + 1 },
                ipAddress,
            });
            return true;
        }
        return false;
    }

    /**
     * Create fraud alert and notify via Telegram
     */
    async createAlert(data: {
        userId: string;
        type: FraudAlertType;
        severity: number;
        description: string;
        metadata?: object;
        ipAddress?: string;
        userAgent?: string;
    }) {
        const alert = await this.prisma.fraudAlert.create({
            data: {
                userId: data.userId,
                type: data.type,
                severity: data.severity,
                description: data.description,
                metadata: data.metadata,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });

        // Get user info
        const user = await this.prisma.user.findUnique({
            where: { id: data.userId },
            select: { displayName: true, phoneNumber: true, email: true },
        });

        // Send Telegram notification
        const severityEmoji = ['', '⚪', '🟢', '🟡', '🟠', '🔴'][data.severity] || '⚪';
        const message = `
${severityEmoji} *FRAUD ALERT* (Severity: ${data.severity}/5)

*Type:* ${data.type}
*User:* ${user?.displayName || 'Unknown'}
*Phone:* ${user?.phoneNumber || 'N/A'}

*Description:*
${data.description}

*Alert ID:* \`${alert.id}\`
    `.trim();

        try {
            await this.telegram.sendMessage(null, message);
        } catch (error) {
            console.error('Failed to send Telegram alert:', error);
        }

        return alert;
    }

    /**
     * Get pending fraud alerts (Admin)
     */
    async getPendingAlerts() {
        return this.prisma.fraudAlert.findMany({
            where: { status: FraudAlertStatus.pending },
            orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
            take: 50,
        });
    }

    /**
     * Get all alerts with filters (Admin)
     */
    async getAlerts(filters?: { status?: FraudAlertStatus; type?: FraudAlertType }) {
        return this.prisma.fraudAlert.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    /**
     * Review alert (Admin)
     */
    async reviewAlert(alertId: string, adminId: string, status: FraudAlertStatus, notes?: string) {
        return this.prisma.fraudAlert.update({
            where: { id: alertId },
            data: {
                status,
                reviewedAt: new Date(),
                reviewedBy: adminId,
                reviewNotes: notes,
            },
        });
    }

    /**
     * Get user fraud history
     */
    async getUserAlerts(userId: string) {
        return this.prisma.fraudAlert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get fraud stats (Admin dashboard)
     */
    async getFraudStats() {
        const [pending, confirmed, total] = await Promise.all([
            this.prisma.fraudAlert.count({ where: { status: FraudAlertStatus.pending } }),
            this.prisma.fraudAlert.count({ where: { status: FraudAlertStatus.confirmed } }),
            this.prisma.fraudAlert.count(),
        ]);

        const byType = await this.prisma.fraudAlert.groupBy({
            by: ['type'],
            _count: true,
        });

        return {
            pending,
            confirmed,
            total,
            byType: byType.map((t) => ({ type: t.type, count: t._count })),
        };
    }
}
