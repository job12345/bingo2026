import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Referral rewards configuration
const SIGNUP_REWARD = 50; // 50 Points สำหรับทั้งผู้ชวนและผู้ถูกชวน
const ACTIVITY_REWARD = 100; // 100 Points เมื่อเพื่อนเล่นครบ 10 รอบ
const ACTIVITY_THRESHOLD = 10; // จำนวนรอบที่ต้องเล่นเพื่อให้ได้ activity reward

@Injectable()
export class ReferralService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate unique referral code for user
     */
    async generateReferralCode(userId: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true },
        });

        if (user?.referralCode) {
            return user.referralCode;
        }

        // Generate unique 8-character code
        const code = this.generateUniqueCode();

        await this.prisma.user.update({
            where: { id: userId },
            data: { referralCode: code },
        });

        return code;
    }

    /**
     * Get user's referral code
     */
    async getReferralCode(userId: string): Promise<{ code: string; shareUrl: string }> {
        let user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.referralCode) {
            // Generate new code if not exists
            const code = await this.generateReferralCode(userId);
            user = { referralCode: code };
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://bingo2026.work.gd';

        return {
            code: user.referralCode!,
            shareUrl: `${baseUrl}/?ref=${user.referralCode}`,
        };
    }

    /**
     * Apply referral code during registration
     */
    async applyReferralCode(refereeId: string, referralCode: string): Promise<boolean> {
        // Find referrer by code
        const referrer = await this.prisma.user.findFirst({
            where: { referralCode: referralCode },
            select: { id: true, displayName: true },
        });

        if (!referrer) {
            throw new BadRequestException('รหัสชวนเพื่อนไม่ถูกต้อง');
        }

        // Can't refer yourself
        if (referrer.id === refereeId) {
            throw new BadRequestException('ไม่สามารถใช้รหัสของตัวเองได้');
        }

        // Check if already referred
        const existingReferral = await this.prisma.referral.findUnique({
            where: { refereeId },
        });

        if (existingReferral) {
            throw new BadRequestException('คุณเคยใช้รหัสชวนเพื่อนแล้ว');
        }

        // Create referral record and give signup rewards
        await this.prisma.$transaction(async (tx) => {
            // Create referral record
            await tx.referral.create({
                data: {
                    referrerId: referrer.id,
                    refereeId,
                    signupRewardPaid: true,
                    activityRewardPaid: false,
                    refereeGamesPlayed: 0,
                    totalRewardEarned: new Decimal(SIGNUP_REWARD * 2), // Both get rewards
                },
            });

            // Update referee's referredById
            await tx.user.update({
                where: { id: refereeId },
                data: { referredById: referrer.id },
            });

            // Give reward to referrer
            const referrerUser = await tx.user.findUnique({
                where: { id: referrer.id },
                select: { pointBalance: true },
            });

            const referrerBalanceBefore = new Decimal(referrerUser!.pointBalance);
            const referrerBalanceAfter = referrerBalanceBefore.add(SIGNUP_REWARD);

            await tx.user.update({
                where: { id: referrer.id },
                data: { pointBalance: referrerBalanceAfter },
            });

            await tx.transaction.create({
                data: {
                    userId: referrer.id,
                    type: TransactionType.payout,
                    amount: new Decimal(SIGNUP_REWARD),
                    status: TransactionStatus.completed,
                    balanceBefore: referrerBalanceBefore,
                    balanceAfter: referrerBalanceAfter,
                    metadata: { type: 'referral_signup', refereeId },
                    notes: 'โบนัสชวนเพื่อน',
                },
            });

            // Give reward to referee
            const refereeUser = await tx.user.findUnique({
                where: { id: refereeId },
                select: { pointBalance: true },
            });

            const refereeBalanceBefore = new Decimal(refereeUser!.pointBalance);
            const refereeBalanceAfter = refereeBalanceBefore.add(SIGNUP_REWARD);

            await tx.user.update({
                where: { id: refereeId },
                data: { pointBalance: refereeBalanceAfter },
            });

            await tx.transaction.create({
                data: {
                    userId: refereeId,
                    type: TransactionType.payout,
                    amount: new Decimal(SIGNUP_REWARD),
                    status: TransactionStatus.completed,
                    balanceBefore: refereeBalanceBefore,
                    balanceAfter: refereeBalanceAfter,
                    metadata: { type: 'referral_signup', referrerId: referrer.id },
                    notes: 'โบนัสใช้รหัสชวนเพื่อน',
                },
            });
        });

        return true;
    }

    /**
     * Get referral stats for user
     */
    async getReferralStats(userId: string) {
        const { code, shareUrl } = await this.getReferralCode(userId);

        const referrals = await this.prisma.referral.findMany({
            where: { referrerId: userId },
            include: {
                referee: {
                    select: { displayName: true, createdAt: true, totalGamesPlayed: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const totalReferred = referrals.length;
        const totalRewardsEarned = referrals.reduce(
            (sum, r) => sum + Number(r.totalRewardEarned),
            0,
        );
        const pendingActivityRewards = referrals.filter(
            (r) => !r.activityRewardPaid && r.refereeGamesPlayed >= ACTIVITY_THRESHOLD,
        ).length;

        return {
            code,
            shareUrl,
            totalReferred,
            totalRewardsEarned,
            pendingActivityRewards,
            referrals: referrals.map((r) => ({
                id: r.id,
                displayName: r.referee.displayName,
                joinedAt: r.createdAt,
                gamesPlayed: r.refereeGamesPlayed,
                signupRewardPaid: r.signupRewardPaid,
                activityRewardPaid: r.activityRewardPaid,
            })),
        };
    }

    /**
     * Update games played and check for activity reward
     * Called after each game ends
     */
    async updateRefereeGamesPlayed(userId: string): Promise<void> {
        const referral = await this.prisma.referral.findUnique({
            where: { refereeId: userId },
        });

        if (!referral || referral.activityRewardPaid) {
            return; // No referral or already paid
        }

        const newGamesPlayed = referral.refereeGamesPlayed + 1;

        await this.prisma.referral.update({
            where: { id: referral.id },
            data: { refereeGamesPlayed: newGamesPlayed },
        });

        // Check if reached activity threshold
        if (newGamesPlayed >= ACTIVITY_THRESHOLD && !referral.activityRewardPaid) {
            await this.giveActivityReward(referral.id, referral.referrerId);
        }
    }

    private async giveActivityReward(referralId: string, referrerId: string): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            // Give activity reward to referrer
            const referrer = await tx.user.findUnique({
                where: { id: referrerId },
                select: { pointBalance: true },
            });

            const balanceBefore = new Decimal(referrer!.pointBalance);
            const balanceAfter = balanceBefore.add(ACTIVITY_REWARD);

            await tx.user.update({
                where: { id: referrerId },
                data: { pointBalance: balanceAfter },
            });

            await tx.transaction.create({
                data: {
                    userId: referrerId,
                    type: TransactionType.payout,
                    amount: new Decimal(ACTIVITY_REWARD),
                    status: TransactionStatus.completed,
                    balanceBefore,
                    balanceAfter,
                    metadata: { type: 'referral_activity' },
                    notes: 'โบนัสเพื่อนเล่นครบ 10 รอบ',
                },
            });

            // Update referral record
            await tx.referral.update({
                where: { id: referralId },
                data: {
                    activityRewardPaid: true,
                    totalRewardEarned: { increment: ACTIVITY_REWARD },
                },
            });
        });
    }

    private generateUniqueCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding I, O, 0, 1 for clarity
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}
