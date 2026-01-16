import { Controller, UseGuards, Get, Put, Post, Body, Req, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { RoomsService } from '../rooms/rooms.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateTelegramSettingsDto, TestTelegramDto } from './dto/telegram-settings.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly roomsService: RoomsService,
  ) { }

  // ===========================================
  // OAuth Settings
  // ===========================================

  /**
   * ดึงการตั้งค่า OAuth ปัจจุบัน
   */
  @Get('settings/oauth')
  @ApiOperation({ summary: 'ดึงการตั้งค่า Google OAuth' })
  async getOAuthSettings() {
    return this.adminService.getOAuthSettings();
  }

  /**
   * อัปเดตการตั้งค่า OAuth
   */
  @Put('settings/oauth')
  @ApiOperation({ summary: 'อัปเดตการตั้งค่า Google OAuth' })
  async updateOAuthSettings(
    @Req() req: Request,
    @Body() dto: { clientId?: string; clientSecret?: string },
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateOAuthSettings(adminId, dto);
  }

  /**
   * ทดสอบเชื่อมต่อ OAuth
   */
  @Post('settings/oauth/test')
  @ApiOperation({ summary: 'ทดสอบเชื่อมต่อ Google OAuth' })
  async testOAuthConnection() {
    return this.adminService.testOAuthConnection();
  }

  // ===========================================
  // Telegram Settings
  // ===========================================

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
    @Req() req: Request,
    @Body() dto: UpdateTelegramSettingsDto,
  ) {
    const adminId = (req as any).user.id;
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

  // ===========================================
  // Room Management
  // ===========================================

  /**
   * Admin ปิดห้อง
   */
  @Post('rooms/:id/close')
  @ApiOperation({ summary: 'ปิดห้อง (Admin)' })
  async closeRoom(@Param('id') roomId: string) {
    return this.roomsService.adminCloseRoom(roomId);
  }
}

