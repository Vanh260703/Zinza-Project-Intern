import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis';
import { randomBytes, createHash } from 'crypto';

const REFRESH_KEY_PREFIX = 'refresh_token:';
const RESET_KEY_PREFIX = 'reset_token:';

interface JwtPayload {
  sub: string; // userId only
  iat: number;
  exp: number;
}

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

  async storeRefreshToken(userId: string): Promise<void> {
    const ttl =
      this.config.get<number>('REFRESH_TOKEN_EXPIRES_IN_DAYS', 7) *
      24 *
      60 *
      60;
    // Lưu userId làm value — không cần JWT, chỉ cần biết session có hợp lệ không
    const key = `${REFRESH_KEY_PREFIX}${userId}`;
    await this.redisService.set(key, userId, ttl);
  }

  // Refresh flow: client gửi access token (dù đã expired) qua cookie
  // Server decode lấy userId → check Redis → rotate → trả access token mới
  async refreshFromAccessToken(expiredToken: string): Promise<string> {
    // Verify chữ ký nhưng bỏ qua expiration — token hết hạn vẫn decode được
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(expiredToken, {
        ignoreExpiration: true,
      });
    } catch {
      throw new UnauthorizedException('Access token không hợp lệ');
    }

    const userId = payload.sub;
    const key = `${REFRESH_KEY_PREFIX}${userId}`;

    // Kiểm tra Redis còn session không (chưa logout / chưa hết 7 ngày)
    const stored = await this.redisService.get(key);
    if (!stored) {
      throw new UnauthorizedException(
        'Session hết hạn, vui lòng đăng nhập lại',
      );
    }

    // Rotate: xóa session cũ, tạo session mới với TTL reset
    await this.storeRefreshToken(userId);

    return userId;
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.redisService.del(`${REFRESH_KEY_PREFIX}${userId}`);
  }

  // Tạo reset token một lần và lưu bản băm vào Redis (TTL theo phút)
  async createResetToken(userId: string): Promise<string> {
    const expiresInMinutes = this.config.get<number>(
      'RESET_TOKEN_EXPIRES_IN_MINUTES',
      15,
    );
    const ttlSeconds = expiresInMinutes * 60;

    const token = randomBytes(32).toString('hex');
    const hashed = createHash('sha256').update(token).digest('hex');
    const key = `${RESET_KEY_PREFIX}${hashed}`;

    // Lưu userId để khi verify có thể biết là của ai
    await this.redisService.set(key, userId, ttlSeconds);

    return token; // token thô sẽ được gửi qua email
  }

  // Xác thực và tiêu hủy reset token (one-time)
  async verifyResetToken(token: string): Promise<string> {
    const hashed = createHash('sha256').update(token).digest('hex');
    const key = `${RESET_KEY_PREFIX}${hashed}`;

    const userId = await this.redisService.get(key);
    if (!userId) {
      throw new UnauthorizedException(
        'Reset token không hợp lệ hoặc đã hết hạn',
      );
    }

    // Một lần sử dụng: xóa key
    await this.redisService.del(key);

    return userId;
  }
}
