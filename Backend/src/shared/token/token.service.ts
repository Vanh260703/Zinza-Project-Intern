import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis';
import { randomBytes, createHash } from 'crypto';

const RT_TOKEN_PREFIX = 'refresh:token:';
const RT_USER_PREFIX = 'refresh:user:';
const RESET_KEY_PREFIX = 'reset_token:';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  // Tạo refresh token ngẫu nhiên, lưu hash vào Redis
  async generateRefreshToken(userId: string): Promise<string> {
    const ttl =
      this.config.get<number>('REFRESH_TOKEN_EXPIRES_IN_DAYS', 7) * 86400;

    const raw = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(raw).digest('hex');

    // refresh:token:{hash} → userId (để verify)
    await this.redisService.set(`${RT_TOKEN_PREFIX}${hash}`, userId, ttl);
    // refresh:user:{userId} → hash (để revoke khi logout)
    await this.redisService.set(`${RT_USER_PREFIX}${userId}`, hash, ttl);

    return raw;
  }

  // Xác thực refresh token → xoá cũ → tạo cặp mới → trả về userId + refreshToken mới
  async verifyAndRotateRefreshToken(
    raw: string,
  ): Promise<{ userId: string; newRefreshToken: string }> {
    const hash = createHash('sha256').update(raw).digest('hex');
    const userId = await this.redisService.get(`${RT_TOKEN_PREFIX}${hash}`);

    if (!userId) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    // Xoá token cũ
    await this.redisService.del(`${RT_TOKEN_PREFIX}${hash}`);
    await this.redisService.del(`${RT_USER_PREFIX}${userId}`);

    // Tạo token mới
    const newRefreshToken = await this.generateRefreshToken(userId);
    return { userId, newRefreshToken };
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    const hash = await this.redisService.get(`${RT_USER_PREFIX}${userId}`);
    if (hash) {
      await this.redisService.del(`${RT_TOKEN_PREFIX}${hash}`);
    }
    await this.redisService.del(`${RT_USER_PREFIX}${userId}`);
  }

  async createResetToken(userId: string): Promise<string> {
    const ttl =
      this.config.get<number>('RESET_TOKEN_EXPIRES_IN_MINUTES', 15) * 60;
    const token = randomBytes(32).toString('hex');
    const hashed = createHash('sha256').update(token).digest('hex');
    await this.redisService.set(`${RESET_KEY_PREFIX}${hashed}`, userId, ttl);
    return token;
  }

  async verifyResetToken(token: string): Promise<string> {
    const hashed = createHash('sha256').update(token).digest('hex');
    const userId = await this.redisService.get(`${RESET_KEY_PREFIX}${hashed}`);
    if (!userId) {
      throw new UnauthorizedException(
        'Reset token không hợp lệ hoặc đã hết hạn',
      );
    }
    await this.redisService.del(`${RESET_KEY_PREFIX}${hashed}`);
    return userId;
  }
}
