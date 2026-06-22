import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  constructor(private readonly config: ConfigService) {}

  // Khởi tạo kết nối Redis khi module được load
  onModuleInit() {
    this.client = new Redis(
      this.config.get<string>('REDIS_URL', 'redis://localhost:6379'),
    );
  }

  // Đóng kết nối Redis khi app shutdown
  async onModuleDestroy() {
    await this.client.quit();
  }

  // Lưu key-value, ttlSeconds là thời gian sống (giây) — optional
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  // Lấy value theo key, trả về null nếu không tồn tại hoặc đã hết TTL
  get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // Xóa key khỏi Redis (dùng khi logout / revoke token)
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
