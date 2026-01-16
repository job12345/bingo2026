import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    async getSettings() {
        return this.settingsService.getAllSettings();
    }

    @Put()
    async updateSetting(
        @CurrentUser('id') userId: string,
        @Body() dto: { key: string; value: any; description?: string },
    ) {
        return this.settingsService.updateSetting(dto.key, dto.value, dto.description, userId);
    }
}
