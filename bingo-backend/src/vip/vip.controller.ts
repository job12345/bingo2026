import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VipService } from './vip.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('vip')
@ApiBearerAuth()
@Controller('vip')
export class VipController {
    constructor(private readonly vipService: VipService) { }

    /**
     * Get current user's VIP status
     */
    @Get('status')
    async getVipStatus(@CurrentUser('id') userId: string) {
        return this.vipService.getVipStatus(userId);
    }

    /**
     * Get VIP levels info
     */
    @Get('levels')
    getVipLevels() {
        return this.vipService.getVipLevelsInfo();
    }

    /**
     * Get VIP leaderboard
     */
    @Get('leaderboard')
    async getVipLeaderboard() {
        return this.vipService.getVipLeaderboard();
    }
}
