import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ดูข้อมูล User ทั้งหมด
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        pointBalance: true,
        totalGamesPlayed: true,
        totalWins: true,
        totalWon: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ดูข้อมูล User ตาม ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        pointBalance: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
        totalGamesPlayed: true,
        totalWins: true,
        totalSpent: true,
        totalWon: true,
        isBanned: true,
        bannedReason: true,
        bannedUntil: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * อัปเดตข้อมูล User
   */
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        displayName: dto.displayName ?? user.displayName,
        avatarUrl: dto.avatarUrl ?? user.avatarUrl,
        bankName: dto.bankName ?? user.bankName,
        bankAccountNumber: dto.bankAccountNumber ?? user.bankAccountNumber,
        bankAccountName: dto.bankAccountName ?? user.bankAccountName,
      },
    });
  }

  /**
   * ดูสถิติการเล่น
   */
  async getStatistics(id: string) {
    const user = await this.findById(id);

    return {
      totalGamesPlayed: user.totalGamesPlayed,
      totalWins: user.totalWins,
      totalSpent: user.totalSpent,
      totalWon: user.totalWon,
      winRate:
        user.totalGamesPlayed > 0
          ? ((user.totalWins / user.totalGamesPlayed) * 100).toFixed(2) + '%'
          : '0%',
      netProfit: Number(user.totalWon) - Number(user.totalSpent),
    };
  }

  /**
   * ดู Leaderboard (Top Winners)
   */
  async getLeaderboard(limit: number = 10) {
    return this.prisma.user.findMany({
      where: {
        role: 'player',
        isBanned: false,
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        totalWins: true,
        totalWon: true,
        totalGamesPlayed: true,
      },
      orderBy: { totalWon: 'desc' },
      take: limit,
    });
  }
}
