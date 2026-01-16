import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FraudService } from './fraud.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FraudAlertStatus, FraudAlertType } from '@prisma/client';

@ApiTags('fraud')
@ApiBearerAuth()
@Controller('fraud')
export class FraudController {
    constructor(private readonly fraudService: FraudService) { }

    /**
     * Get pending fraud alerts (Admin)
     */
    @Get('pending')
    async getPendingAlerts() {
        return this.fraudService.getPendingAlerts();
    }

    /**
     * Get all alerts with filters (Admin)
     */
    @Get('alerts')
    async getAlerts(
        @Query('status') status?: FraudAlertStatus,
        @Query('type') type?: FraudAlertType,
    ) {
        return this.fraudService.getAlerts({ status, type });
    }

    /**
     * Get fraud stats (Admin)
     */
    @Get('stats')
    async getFraudStats() {
        return this.fraudService.getFraudStats();
    }

    /**
     * Get user's fraud alerts (Admin)
     */
    @Get('user/:userId')
    async getUserAlerts(@Param('userId') userId: string) {
        return this.fraudService.getUserAlerts(userId);
    }

    /**
     * Review fraud alert (Admin)
     */
    @Post(':id/review')
    async reviewAlert(
        @CurrentUser('id') adminId: string,
        @Param('id') alertId: string,
        @Body() dto: { status: FraudAlertStatus; notes?: string },
    ) {
        return this.fraudService.reviewAlert(alertId, adminId, dto.status, dto.notes);
    }
}
