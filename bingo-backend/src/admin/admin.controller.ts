import { Controller, UseGuards, Get, Put, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateTelegramSettingsDto, TestTelegramDto } from './dto/telegram-settings.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * ดึงการตั้งค่า Telegram ปัจจุบัน
   */
  @Get('settings/telegram')
  @ApiOperation({ summary: 'ดึงการตั้งค่า Telegram' })
  async getTelegramSettings() {
    return this.adminService.getTelegramSettings();
  }

  /**
   * อัปเดตการตั้งค่า Telegram
   */
  @Put('settings/telegram')
  @ApiOperation({ summary: 'อัปเดตการตั้งค่า Telegram' })
  async updateTelegramSettings(
    @Req() req,
    @Body() dto: UpdateTelegramSettingsDto,
  ) {
    const adminId = req.user.id; // ดึง Admin ID จาก JWT
    return this.adminService.updateTelegramSettings(adminId, dto);
  }

  /**
   * ทดสอบส่งข้อความ Telegram
   */
  @Post('settings/telegram/test')
  @ApiOperation({ summary: 'ทดสอบส่งข้อความ Telegram' })
  async testTelegramNotification(@Body() dto: TestTelegramDto) {
    return this.adminService.testTelegramNotification(dto.chatId);
  }
}
