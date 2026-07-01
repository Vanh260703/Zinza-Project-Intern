import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/shared/guards';
import { CurrentUser } from 'src/shared/decorators';
import { User } from 'src/modules/users/entities/user.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

function parseExpiryMs(value: string): number {
  const n = parseInt(value, 10);
  if (value.endsWith('d')) return n * 24 * 60 * 60 * 1000;
  if (value.endsWith('h')) return n * 60 * 60 * 1000;
  if (value.endsWith('m')) return n * 60 * 1000;
  return n * 1000;
}

@Controller('auth')
export class AuthController {
  private readonly accessCookieOptions: object;
  private readonly refreshCookieOptions: object;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const base = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };
    const expiresIn = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRES_IN',
      '15m',
    );
    this.accessCookieOptions = { ...base, maxAge: parseExpiryMs(expiresIn) };
    this.refreshCookieOptions = { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 };
  }

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, this.accessCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, this.refreshCookieOptions);
  }

  // POST /auth/register
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  // POST /auth/login
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  // POST /auth/refresh-token
  // Đọc refresh_token từ httpOnly cookie → validate Redis → rotate
  // → set cả 2 cookie mới
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token không được cung cấp');

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);
    this.setTokenCookies(res, accessToken, newRefreshToken);
    return { message: 'Token refreshed' };
  }

  // POST /auth/logout
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    return { message: 'Logged out' };
  }

  // POST /auth/forgot-password
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
  }

  // POST /auth/reset-password
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'Đặt lại mật khẩu thành công.' };
  }
}
