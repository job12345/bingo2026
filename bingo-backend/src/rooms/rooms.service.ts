import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SettingsService } from '../settings/settings.service';

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

  async create(userId: string, dto: CreateRoomDto) {
    // Get global fee percentage from settings
    const feeConfig = this.settings.get('fee_percentage', { value: 10 });
    const feePercentage = Number(feeConfig.value);

    return this.prisma.room.create({
      data: {
        name: dto.name,
        creatorId: userId,
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
}
