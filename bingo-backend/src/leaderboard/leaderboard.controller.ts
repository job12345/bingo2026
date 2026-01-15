import { Controller, Get, Query, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

/**
 * Leaderboard Controller - API สำหรับ ranking และ achievements
 */
@Controller('leaderboard')
export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) { }

    /**
     * Get daily leaderboard (Top 10 ของวันนี้)
     */
    @Get('daily')
    async getDailyLeaderboard(@Query('limit') limit?: number) {
        return this.leaderboardService.getDailyLeaderboard(limit || 10);
    }

    /**
     * Get weekly leaderboard (Top 10 สัปดาห์นี้)
     */
    @Get('weekly')
    async getWeeklyLeaderboard(@Query('limit') limit?: number) {
        return this.leaderboardService.getWeeklyLeaderboard(limit || 10);
    }

    /**
     * Get all-time leaderboard (Top 10 ตลอดกาล)
     */
    @Get('all-time')
    async getAllTimeLeaderboard(@Query('limit') limit?: number) {
        return this.leaderboardService.getAllTimeLeaderboard(limit || 10);
    }

    /**
     * Get leaderboard by category
     */
    @Get('category/:category')
    async getLeaderboardByCategory(
        @Param('category') category: 'wins' | 'earnings' | 'games',
        @Query('limit') limit?: number,
    ) {
        return this.leaderboardService.getLeaderboardByCategory(category, limit || 10);
    }

    /**
     * Get user stats
     */
    @Get('user/:userId/stats')
    async getUserStats(@Param('userId') userId: string) {
        return this.leaderboardService.getUserStats(userId);
    }

    /**
     * Get user rank
     */
    @Get('user/:userId/rank')
    async getUserRank(@Param('userId') userId: string) {
        return this.leaderboardService.getUserRank(userId);
    }
}
