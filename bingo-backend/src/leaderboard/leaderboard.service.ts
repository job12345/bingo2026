import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    totalWins: number;
    totalGamesPlayed: number;
    totalWon: number;
    winRate: number;
}

export interface UserStats {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    totalWins: number;
    totalGamesPlayed: number;
    totalWon: number;
    totalSpent: number;
    winRate: number;
    netProfit: number;
    rank: {
        daily: number | null;
        weekly: number | null;
        allTime: number;
    };
}

/**
 * Leaderboard Service - จัดการ ranking และ stats
 */
@Injectable()
export class LeaderboardService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get daily leaderboard (based on wins today)
     */
    async getDailyLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const winners = await this.prisma.game.groupBy({
            by: ['winnerId'],
            where: {
                winnerId: { not: null },
                endedAt: { gte: today },
            },
            _count: { id: true },
            _sum: { payoutAmount: true },
            orderBy: { _count: { id: 'desc' } },
            take: limit,
        });

        const userIds = winners.map((w) => w.winnerId).filter(Boolean) as string[];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                totalGamesPlayed: true,
            },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        return winners.map((w, index) => {
            const user = userMap.get(w.winnerId!);
            const wins = w._count.id;
            const gamesPlayed = user?.totalGamesPlayed || 0;

            return {
                rank: index + 1,
                userId: w.winnerId!,
                displayName: user?.displayName || 'Unknown',
                avatarUrl: user?.avatarUrl || null,
                totalWins: wins,
                totalGamesPlayed: gamesPlayed,
                totalWon: Number(w._sum.payoutAmount || 0),
                winRate: gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0,
            };
        });
    }

    /**
     * Get weekly leaderboard
     */
    async getWeeklyLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const winners = await this.prisma.game.groupBy({
            by: ['winnerId'],
            where: {
                winnerId: { not: null },
                endedAt: { gte: weekAgo },
            },
            _count: { id: true },
            _sum: { payoutAmount: true },
            orderBy: { _count: { id: 'desc' } },
            take: limit,
        });

        const userIds = winners.map((w) => w.winnerId).filter(Boolean) as string[];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                totalGamesPlayed: true,
            },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        return winners.map((w, index) => {
            const user = userMap.get(w.winnerId!);
            const wins = w._count.id;
            const gamesPlayed = user?.totalGamesPlayed || 0;

            return {
                rank: index + 1,
                userId: w.winnerId!,
                displayName: user?.displayName || 'Unknown',
                avatarUrl: user?.avatarUrl || null,
                totalWins: wins,
                totalGamesPlayed: gamesPlayed,
                totalWon: Number(w._sum.payoutAmount || 0),
                winRate: gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0,
            };
        });
    }

    /**
     * Get all-time leaderboard (based on total wins)
     */
    async getAllTimeLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'player',
                totalWins: { gt: 0 },
            },
            orderBy: { totalWins: 'desc' },
            take: limit,
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                totalWins: true,
                totalGamesPlayed: true,
                totalWon: true,
            },
        });

        return users.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            totalWins: user.totalWins,
            totalGamesPlayed: user.totalGamesPlayed,
            totalWon: Number(user.totalWon),
            winRate: user.totalGamesPlayed > 0
                ? (user.totalWins / user.totalGamesPlayed) * 100
                : 0,
        }));
    }

    /**
     * Get leaderboard by category
     */
    async getLeaderboardByCategory(
        category: 'wins' | 'earnings' | 'games',
        limit: number = 10,
    ): Promise<LeaderboardEntry[]> {
        let orderBy: Prisma.UserOrderByWithRelationInput;

        switch (category) {
            case 'wins':
                orderBy = { totalWins: 'desc' };
                break;
            case 'earnings':
                orderBy = { totalWon: 'desc' };
                break;
            case 'games':
                orderBy = { totalGamesPlayed: 'desc' };
                break;
            default:
                orderBy = { totalWins: 'desc' };
        }

        const users = await this.prisma.user.findMany({
            where: { role: 'player' },
            orderBy,
            take: limit,
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                totalWins: true,
                totalGamesPlayed: true,
                totalWon: true,
            },
        });

        return users.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            totalWins: user.totalWins,
            totalGamesPlayed: user.totalGamesPlayed,
            totalWon: Number(user.totalWon),
            winRate: user.totalGamesPlayed > 0
                ? (user.totalWins / user.totalGamesPlayed) * 100
                : 0,
        }));
    }

    /**
     * Get user stats
     */
    async getUserStats(userId: string): Promise<UserStats> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                totalWins: true,
                totalGamesPlayed: true,
                totalWon: true,
                totalSpent: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const rank = await this.getUserRank(userId);

        return {
            userId: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            totalWins: user.totalWins,
            totalGamesPlayed: user.totalGamesPlayed,
            totalWon: Number(user.totalWon),
            totalSpent: Number(user.totalSpent),
            winRate: user.totalGamesPlayed > 0
                ? (user.totalWins / user.totalGamesPlayed) * 100
                : 0,
            netProfit: Number(user.totalWon) - Number(user.totalSpent),
            rank,
        };
    }

    /**
     * Get user rank
     */
    async getUserRank(userId: string): Promise<{ daily: number | null; weekly: number | null; allTime: number }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { totalWins: true },
        });

        if (!user) {
            return { daily: null, weekly: null, allTime: 0 };
        }

        // All-time rank
        const allTimeRank = await this.prisma.user.count({
            where: {
                role: 'player',
                totalWins: { gt: user.totalWins },
            },
        });

        // Daily rank (simplified - based on today's wins)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayWins = await this.prisma.game.count({
            where: {
                winnerId: userId,
                endedAt: { gte: today },
            },
        });

        const dailyRank = todayWins > 0 ? await this.getDailyRank(userId) : null;

        // Weekly rank
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyWins = await this.prisma.game.count({
            where: {
                winnerId: userId,
                endedAt: { gte: weekAgo },
            },
        });

        const weeklyRank = weeklyWins > 0 ? await this.getWeeklyRank(userId) : null;

        return {
            daily: dailyRank,
            weekly: weeklyRank,
            allTime: allTimeRank + 1,
        };
    }

    private async getDailyRank(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const myWins = await this.prisma.game.count({
            where: {
                winnerId: userId,
                endedAt: { gte: today },
            },
        });

        const betterPlayers = await this.prisma.game.groupBy({
            by: ['winnerId'],
            where: {
                winnerId: { not: null },
                endedAt: { gte: today },
            },
            _count: { id: true },
            having: {
                id: { _count: { gt: myWins } },
            },
        });

        return betterPlayers.length + 1;
    }

    private async getWeeklyRank(userId: string): Promise<number> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const myWins = await this.prisma.game.count({
            where: {
                winnerId: userId,
                endedAt: { gte: weekAgo },
            },
        });

        const betterPlayers = await this.prisma.game.groupBy({
            by: ['winnerId'],
            where: {
                winnerId: { not: null },
                endedAt: { gte: weekAgo },
            },
            _count: { id: true },
            having: {
                id: { _count: { gt: myWins } },
            },
        });

        return betterPlayers.length + 1;
    }
}
