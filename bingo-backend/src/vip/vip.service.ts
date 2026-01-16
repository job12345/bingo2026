import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VipLevel } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// VIP Level Requirements (totalSpent in Points)
const VIP_LEVELS = {
    bronze: { minSpent: 0, feeDiscount: 0, bonus: 0, name: 'Bronze' },
    silver: { minSpent: 5000, feeDiscount: 5, bonus: 2, name: 'Silver' },
    gold: { minSpent: 20000, feeDiscount: 10, bonus: 5, name: 'Gold' },
    platinum: { minSpent: 100000, feeDiscount: 15, bonus: 10, name: 'Platinum' },
};

@Injectable()
export class VipService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get VIP status for user
     */
    async getVipStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                vipLevel: true,
                vipPoints: true,
                vipExpiredAt: true,
                totalSpent: true,
            },
        });

        if (!user) {
            return null;
        }

        const currentLevel = VIP_LEVELS[user.vipLevel];
        const nextLevel = this.getNextLevel(user.vipLevel);
        const nextLevelConfig = nextLevel ? VIP_LEVELS[nextLevel] : null;
        const spentAmount = Number(user.totalSpent);

        return {
            level: user.vipLevel,
            levelName: currentLevel.name,
            vipPoints: user.vipPoints,
            feeDiscount: currentLevel.feeDiscount,
            bonus: currentLevel.bonus,
            totalSpent: spentAmount,
            nextLevel: nextLevel
                ? {
                    level: nextLevel,
                    name: nextLevelConfig?.name,
                    required: nextLevelConfig?.minSpent,
                    remaining: (nextLevelConfig?.minSpent || 0) - spentAmount,
                    progress: Math.min(100, (spentAmount / (nextLevelConfig?.minSpent || 1)) * 100),
                }
                : null,
            expiresAt: user.vipExpiredAt,
        };
    }

    /**
     * Check and update VIP level based on spending
     */
    async updateVipLevel(userId: string): Promise<VipLevel> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { totalSpent: true, vipLevel: true },
        });

        if (!user) return VipLevel.bronze;

        const spent = Number(user.totalSpent);
        let newLevel: VipLevel = VipLevel.bronze;

        if (spent >= VIP_LEVELS.platinum.minSpent) {
            newLevel = VipLevel.platinum;
        } else if (spent >= VIP_LEVELS.gold.minSpent) {
            newLevel = VipLevel.gold;
        } else if (spent >= VIP_LEVELS.silver.minSpent) {
            newLevel = VipLevel.silver;
        }

        // Update if level changed
        if (newLevel !== user.vipLevel) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    vipLevel: newLevel,
                    vipExpiredAt: this.getNextYearDate(),
                },
            });
        }

        return newLevel;
    }

    /**
     * Get fee discount for user based on VIP level
     */
    async getFeeDiscount(userId: string): Promise<number> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { vipLevel: true },
        });

        if (!user) return 0;

        return VIP_LEVELS[user.vipLevel].feeDiscount;
    }

    /**
     * Get bonus percentage for user based on VIP level
     */
    async getBonusPercentage(userId: string): Promise<number> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { vipLevel: true },
        });

        if (!user) return 0;

        return VIP_LEVELS[user.vipLevel].bonus;
    }

    /**
     * Add VIP points to user
     */
    async addVipPoints(userId: string, points: number) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { vipPoints: { increment: points } },
        });
        return this.updateVipLevel(userId);
    }

    /**
     * Get VIP level requirements info
     */
    getVipLevelsInfo() {
        return Object.entries(VIP_LEVELS).map(([key, value]) => ({
            level: key,
            ...value,
        }));
    }

    /**
     * Get leaderboard for VIP users
     */
    async getVipLeaderboard(limit = 10) {
        return this.prisma.user.findMany({
            where: {
                vipLevel: { not: VipLevel.bronze },
            },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                vipLevel: true,
                vipPoints: true,
                totalSpent: true,
            },
            orderBy: [
                { vipLevel: 'desc' },
                { vipPoints: 'desc' },
            ],
            take: limit,
        });
    }

    private getNextLevel(currentLevel: VipLevel): VipLevel | null {
        const levels: VipLevel[] = [VipLevel.bronze, VipLevel.silver, VipLevel.gold, VipLevel.platinum];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    }

    private getNextYearDate(): Date {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
    }
}
