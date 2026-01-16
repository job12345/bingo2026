import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutService } from './payout.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('payout')
@ApiBearerAuth()
@Controller('payout')
export class PayoutController {
    constructor(private readonly payoutService: PayoutService) { }

    /**
     * Get payout settings
     */
    @Get('settings')
    getPayoutSettings() {
        return this.payoutService.getPayoutSettings();
    }

    /**
     * Request payout
     */
    @Post('request')
    async requestPayout(
        @CurrentUser('id') userId: string,
        @Body()
        dto: {
            amount: number;
            method: 'bank' | 'promptpay';
            bankAccount?: string;
            bankName?: string;
            promptPayNumber?: string;
        },
    ) {
        return this.payoutService.requestPayout({
            userId,
            ...dto,
        });
    }

    /**
     * Get user's payout history
     */
    @Get('history')
    async getPayoutHistory(@CurrentUser('id') userId: string) {
        return this.payoutService.getPayoutHistory(userId);
    }

    /**
     * Get pending payouts (Admin)
     */
    @Get('pending')
    async getPendingPayouts() {
        return this.payoutService.getPendingPayouts();
    }

    /**
     * Approve payout (Admin)
     */
    @Post(':id/approve')
    async approvePayout(@Param('id') transactionId: string) {
        return this.payoutService.approvePayout(transactionId);
    }

    /**
     * Reject payout (Admin)
     */
    @Post(':id/reject')
    async rejectPayout(
        @Param('id') transactionId: string,
        @Body() dto: { reason: string },
    ) {
        return this.payoutService.rejectPayout(transactionId, dto.reason);
    }
}
