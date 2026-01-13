import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'ดูข้อมูลผู้ใช้ปัจจุบัน' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'อัปเดตข้อมูลผู้ใช้' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Get('me/statistics')
  @ApiOperation({ summary: 'ดูสถิติการเล่น' })
  async getStatistics(@CurrentUser('id') userId: string) {
    return this.usersService.getStatistics(userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'ดู Leaderboard (Top Winners)' })
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.usersService.getLeaderboard(limit ? parseInt(limit.toString()) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูข้อมูล User ตาม ID' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
