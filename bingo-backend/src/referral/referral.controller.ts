import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('referral')
@ApiBearerAuth()
@Controller('referral')
export class ReferralController {
    constructor(private readonly referralService: ReferralService) { }

    /**
     * Get user's referral code
     */
    @Get('code')
    async getReferralCode(@CurrentUser('id') userId: string) {
        return this.referralService.getReferralCode(userId);
    }

    /**
     * Apply referral code (ใช้รหัสชวนเพื่อน)
     */
    @Post('apply')
    async applyReferralCode(
        @CurrentUser('id') userId: string,
        @Body() dto: { code: string },
    ) {
        await this.referralService.applyReferralCode(userId, dto.code);
        return { success: true, message: 'ใช้รหัสชวนเพื่อนสำเร็จ! คุณได้รับ 50 Points' };
    }

    /**
     * Get referral stats
     */
    @Get('stats')
    async getReferralStats(@CurrentUser('id') userId: string) {
        return this.referralService.getReferralStats(userId);
    }
}
