import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Google OAuth Login
   * สร้างหรืออัปเดต User จาก Google Profile
   */
  async googleLogin(googleUser: any) {
    if (!googleUser) {
      throw new UnauthorizedException('Google authentication failed');
    }

    // หา User จาก Google ID หรือสร้างใหม่
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      // สร้าง User ใหม่
      user = await this.prisma.user.create({
        data: {
          googleId: googleUser.id,
          email: googleUser.email,
          displayName: googleUser.displayName || googleUser.email.split('@')[0],
          avatarUrl: googleUser.picture,
          role: 'player',
          lastLoginAt: new Date(),
        },
      });
    } else {
      // อัปเดต Last Login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // สร้าง JWT Tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // บันทึก Refresh Token
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        pointBalance: user.pointBalance,
      },
    };
  }

  /**
   * Refresh Access Token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // ตรวจสอบว่า Refresh Token ยังอยู่ใน Database
      const session = await this.prisma.session.findFirst({
        where: {
          userId: payload.sub,
          refreshToken,
          expiresAt: { gte: new Date() },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // สร้าง Access Token ใหม่
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout (Revoke Refresh Token)
   */
  async logout(userId: string, refreshToken: string) {
    await this.prisma.session.deleteMany({
      where: { userId, refreshToken },
    });
  }

  /**
   * Get User Profile
   */
  async getUserProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  /**
   * Generate Access Token (Short-lived)
   */
  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Generate Refresh Token (Long-lived)
   */
  private generateRefreshToken(user: any): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

  /**
   * Save Refresh Token to Database
   */
  private async saveRefreshToken(userId: string, refreshToken: string) {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });
  }
}
