import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'ดูรายการห้องทั้งหมด' })
  async findAll() {
    return this.roomsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดห้อง' })
  async findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'สร้างห้องใหม่' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(userId, dto, userRole);
  }

  @Put(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลห้อง' })
  async update(
    @Param('id') roomId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(roomId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'ปิดห้อง (Soft Delete)' })
  async delete(@Param('id') roomId: string, @CurrentUser('id') userId: string) {
    return this.roomsService.delete(roomId, userId);
  }

  /**
   * Scheduled task: ปิดห้องว่างอัตโนมัติทุก 10 นาที
   * เฉพาะห้องที่ user สร้าง (ไม่ใช่ admin) และไม่มีกิจกรรมเกิน 1 ชั่วโมง
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleRoomCleanup() {
    await this.roomsService.closeExpiredRooms();
  }
}

