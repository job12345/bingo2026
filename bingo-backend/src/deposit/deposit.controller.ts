import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DepositService } from './deposit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('deposit')
@ApiBearerAuth()
@Controller('deposit')
export class DepositController {
    constructor(private readonly depositService: DepositService) { }

    /**
     * Get deposit configuration
     */
    @Get('config')
    getDepositConfig() {
        return this.depositService.getDepositConfig();
    }

    /**
     * Create Bank Transfer deposit
     */
    @Post('bank')
    async createBankDeposit(
        @CurrentUser('id') userId: string,
        @Body() dto: { amount: number },
    ) {
        return this.depositService.createBankTransferDeposit(userId, dto.amount);
    }

    /**
     * Create Crypto deposit
     */
    @Post('crypto')
    async createCryptoDeposit(
        @CurrentUser('id') userId: string,
        @Body() dto: { amount: number; network: string; currency: string },
    ) {
        return this.depositService.createCryptoDeposit(
            userId,
            dto.amount,
            dto.network,
            dto.currency,
        );
    }

    /**
     * Create PromptPay deposit
     */
    @Post('promptpay')
    async createPromptPayDeposit(
        @CurrentUser('id') userId: string,
        @Body() dto: { amount: number },
    ) {
        return this.depositService.createPromptPayDeposit(userId, dto.amount);
    }

    /**
     * Get deposit history
     */
    @Get('history')
    async getDepositHistory(@CurrentUser('id') userId: string) {
        return this.depositService.getDepositHistory(userId);
    }

    /**
     * Get pending deposits (Admin)
     */
    @Get('pending')
    async getPendingDeposits() {
        return this.depositService.getPendingDeposits();
    }

    /**
     * Approve deposit (Admin)
     */
    @Post(':id/approve')
    async approveDeposit(
        @CurrentUser('id') adminId: string,
        @Param('id') depositId: string,
    ) {
        return this.depositService.approveDeposit(depositId, adminId);
    }

    /**
     * Reject deposit (Admin)
     */
    @Post(':id/reject')
    async rejectDeposit(
        @CurrentUser('id') adminId: string,
        @Param('id') depositId: string,
        @Body() dto: { reason: string },
    ) {
        return this.depositService.rejectDeposit(depositId, adminId, dto.reason);
    }

    /**
     * Confirm crypto deposit (Webhook)
     */
    @Post(':id/confirm-crypto')
    async confirmCryptoDeposit(
        @Param('id') depositId: string,
        @Body() dto: { txHash: string },
    ) {
        return this.depositService.confirmCryptoDeposit(depositId, dto.txHash);
    }
}
