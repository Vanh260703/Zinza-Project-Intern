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
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 phút

const COOKIE_OPTIONS = {
  httpOnly: true, // JS client không đọc được → chống XSS
  secure: process.env.NODE_ENV === 'production', // chỉ gửi qua HTTPS ở production
  sameSite: 'strict' as const, // chống CSRF
  maxAge: ACCESS_TOKEN_TTL_MS,
};

function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.authService.register(dto);
    setAccessTokenCookie(res, accessToken);
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
    setAccessTokenCookie(res, accessToken);
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
    setAccessTokenCookie(res, accessToken);
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
