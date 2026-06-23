import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/users/entities/user.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const ACCESS_TOKEN_COOKIE = 'access_token';

// '15m' | '1h' | '7d' | '900s' | '900' → milliseconds
function parseExpiryMs(value: string): number {
  const n = parseInt(value, 10);
  if (value.endsWith('d')) return n * 24 * 60 * 60 * 1000;
  if (value.endsWith('h')) return n * 60 * 60 * 1000;
  if (value.endsWith('m')) return n * 60 * 1000;
  return n * 1000; // 's' hoặc bare number → giây
}

@Controller('auth')
export class AuthController {
  private readonly cookieOptions: object;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const expiresIn = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRES_IN',
      '15m',
    );
    this.cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: parseExpiryMs(expiresIn),
    };
  }

  private setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, this.cookieOptions);
  }

  // POST /auth/register
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.authService.register(dto);
    this.setAccessTokenCookie(res, accessToken);
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
    const { user, accessToken } = await this.authService.login(dto);
    this.setAccessTokenCookie(res, accessToken);
    return { user };
  }

  // POST /auth/refresh-token
  // Đọc access token (dù expired) từ cookie → server tự check Redis
  // → rotate session → set access token mới vào cookie
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const expiredToken = req.cookies[ACCESS_TOKEN_COOKIE] as string;
    const { accessToken } = await this.authService.refresh(expiredToken);
    this.setAccessTokenCookie(res, accessToken);
    return { accessToken, message: 'Token refreshed' };
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
    return { message: 'Logged out' };
  }

  // POST /auth/forgot-password
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);

    // Trả message giống nhau dù email có tồn tại hay không (chống enumeration)
    return {
      message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.',
    };
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
