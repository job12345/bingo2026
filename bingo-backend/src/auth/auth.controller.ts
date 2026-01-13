import { Controller, Get, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register with Phone & Password
   * สมัครสมาชิกด้วยเบอร์โทรศัพท์และรหัสผ่าน
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'สมัครสมาชิก (เบอร์โทร + รหัสผ่าน)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Login with Phone & Password
   * เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน
   */
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'เข้าสู่ระบบ (เบอร์โทร + รหัสผ่าน)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Google OAuth Login
   * Redirect ไป Google Login Page
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'เริ่มต้น Google OAuth Login' })
  async googleAuth() {
    // Guard จะจัดการ redirect
  }

  /**
   * Google OAuth Callback
   * รับข้อมูลจาก Google หลัง Login สำเร็จ
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth Callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.googleLogin(req.user);

    // Redirect กลับไป Frontend พร้อม Token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }

  /**
   * Refresh Access Token
   */
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Access Token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * Logout
   */
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (Revoke Refresh Token)' })
  async logout(@CurrentUser('id') userId: string, @Body() dto: RefreshTokenDto) {
    await this.authService.logout(userId, dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  /**
   * Get Current User Profile
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูข้อมูลผู้ใช้ปัจจุบัน' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getUserProfile(user.id);
  }
}
