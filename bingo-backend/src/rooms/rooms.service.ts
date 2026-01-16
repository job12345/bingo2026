import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SettingsService } from '../settings/settings.service';

// Constants
const MAX_ROOMS_PER_USER = 3;
const ROOM_EXPIRE_HOURS = 1;

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) { }

  async findAll() {
    return this.prisma.room.findMany({
      where: { isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
        topWinner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('ไม่พบห้องนี้');
    }

    return room;
  }

  async create(userId: string, dto: CreateRoomDto, userRole?: string) {
    // Check room limit for non-admin users
    if (userRole !== 'admin') {
      const existingRooms = await this.prisma.room.count({
        where: { creatorId: userId, isActive: true },
      });

      if (existingRooms >= MAX_ROOMS_PER_USER) {
        throw new BadRequestException(`คุณสร้างห้องได้สูงสุด ${MAX_ROOMS_PER_USER} ห้อง`);
      }
    }

    // Get global fee percentage from settings
    const feeConfig: any = this.settings.get('fee_percentage', 10);
    let feePercentage = typeof feeConfig === 'object' && feeConfig !== null
      ? Number(feeConfig.value) || 10
      : Number(feeConfig) || 10;

    // Only admin can create fee-free rooms
    if (dto.feePercentage !== undefined) {
      if (dto.feePercentage === 0 && userRole !== 'admin') {
        throw new BadRequestException('เฉพาะแอดมินเท่านั้นที่สามารถสร้างห้องฟรีค่าธรรมเนียม');
      }
      feePercentage = dto.feePercentage;
    }

    return this.prisma.room.create({
      data: {
        name: dto.name,
        creator: { connect: { id: userId } },
        drawMode: dto.drawMode,
        ballSet: dto.ballSet,
        maxPlayers: dto.maxPlayers,
        maxRounds: dto.maxRounds,
        cardPrice: dto.cardPrice,
        maxCardsPerPlayer: dto.maxCardsPerPlayer || 4,
        feePercentage: feePercentage,
        isActive: true,
        currentRound: 1,
        totalRoundsPlayed: 0,
        totalPotCollected: 0,
        totalFeeCollected: 0,
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async update(roomId: string, userId: string, dto: UpdateRoomDto) {
    // ตรวจสอบว่าห้องมีอยู่จริง
    const room = await this.findOne(roomId);

    // เช็คว่าเป็นเจ้าของห้องหรือไม่
    if (room.creatorId !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขห้องนี้');
    }

    // อัพเดท
    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        ...dto,
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(roomId: string, userId: string) {
    // ตรวจสอบว่าห้องมีอยู่จริง
    const room = await this.findOne(roomId);

    // เช็คว่าเป็นเจ้าของห้องหรือไม่
    if (room.creatorId !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์ลบห้องนี้');
    }

    // ปิดห้อง (Soft delete)
    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Admin ปิดห้องโดยตรง
   */
  async adminCloseRoom(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('ไม่พบห้องนี้');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: { isActive: false },
    });
  }

  /**
   * ปิดห้องที่ว่างเกิน 1 ชั่วโมง (เฉพาะห้องที่ user สร้าง ไม่รวม admin)
   * เรียกจาก scheduled task ทุก 10 นาที
   */
  async closeExpiredRooms() {
    const expireTime = new Date(Date.now() - ROOM_EXPIRE_HOURS * 60 * 60 * 1000);

    // หาห้องที่ต้องปิด: active, idle state, ไม่มีกิจกรรมเกิน 1 ชม., สร้างโดย user (ไม่ใช่ admin)
    const roomsToClose = await this.prisma.room.findMany({
      where: {
        isActive: true,
        currentState: 'idle',
        updatedAt: { lt: expireTime },
        creator: {
          role: { not: 'admin' },
        },
      },
      select: { id: true, name: true },
    });

    if (roomsToClose.length > 0) {
      await this.prisma.room.updateMany({
        where: {
          id: { in: roomsToClose.map(r => r.id) },
        },
        data: { isActive: false },
      });

      console.log(`🧹 Auto-closed ${roomsToClose.length} expired rooms:`, roomsToClose.map(r => r.name));
    }

    return { closed: roomsToClose.length };
  }
}

