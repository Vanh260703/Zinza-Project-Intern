import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';
import { TokenService } from 'src/shared/token';
import { MailService } from 'src/shared/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.usersService.create(dto);
    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);
    return { user, accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const { password: _, ...userData } = user;
    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);
    return { user: userData, accessToken, refreshToken };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, newRefreshToken } =
      await this.tokenService.verifyAndRotateRefreshToken(refreshToken);
    const accessToken = this.tokenService.generateAccessToken(userId);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(userId);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);

    // Không tiết lộ email có tồn tại hay không (chống email enumeration):
    // luôn trả về như nhau, chỉ gửi mail khi user thực sự tồn tại.
    if (!user) {
      return;
    }

    const token = await this.tokenService.createResetToken(user.id);

    void this.mailService.sendResetPassword(user, token).catch((err) => {
      this.logger.error(
        `Gửi mail reset password thất bại cho ${user.email}`,
        err instanceof Error ? err.stack : err,
      );
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // Verify + tiêu hủy token (one-time). Sai/hết hạn sẽ ném 401.
    const userId = await this.tokenService.verifyResetToken(dto.token);

    await this.usersService.updatePassword(userId, dto.newPassword);

    // Đổi mật khẩu xong → revoke session cũ để buộc đăng nhập lại mọi nơi.
    await this.tokenService.revokeRefreshToken(userId);
  }
}
