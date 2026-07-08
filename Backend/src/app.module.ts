import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './shared/redis';

// Entities
import { User } from './modules/users/entities/user.entity';
import { UserNovelRead } from './modules/users/entities/user-novel-read.entity';
import { UserDailyRead } from './modules/users/entities/user-daily-read.entity';
import { UserNovelBookMark } from './modules/users/entities/user-novel-bookmark.entity';
import { Novel } from './modules/novels/entities/novel.entity';
import { NovelCategory } from './modules/novels/entities/novel-category.entity';
import { NovelTag } from './modules/novels/entities/novel-tag.entity';
import { NovelRating } from './modules/novels/entities/novel-rating.entity';
import { NovelNomination } from './modules/novels/entities/novel-nomination.entity';
import { Chapter } from './modules/chapters/entities/chapter.entity';
import { Category } from './modules/categories/entities/category.entity';
import { Tag } from './modules/tags/entities/tag.entity';
import { UserWallet } from './modules/payments/entities/user-wallet.entity';
import { PaymentOrder } from './modules/payments/entities/payment-order.entity';
import { WalletTransaction } from './modules/payments/entities/wallet-transaction.entity';
import { ChapterPurchase } from './modules/payments/entities/chapter-purchase.entity';
import { SepayWebhookLog } from './modules/payments/entities/sepay-webhook-log.entity';
import { CandyPackage } from './modules/payments/entities/candy-package.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { MailModule } from './shared/mail/mail.module';
import { CloudinaryModule } from './shared/cloudinary/cloudinary.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NovelsModule } from './modules/novels/novels.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { Comment } from './modules/comments/entities/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        synchronize: true,
        entities: [
          User,
          UserNovelRead,
          UserDailyRead,
          UserNovelBookMark,
          Novel,
          NovelCategory,
          NovelTag,
          NovelRating,
          NovelNomination,
          Chapter,
          Category,
          Tag,
          UserWallet,
          PaymentOrder,
          WalletTransaction,
          ChapterPurchase,
          SepayWebhookLog,
          CandyPackage,
          Notification,
          Comment,
        ],
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // window 60 giây
        limit: 100, // tối đa 100 request / 60s / IP
      },
    ]),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(
          config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        );
        return {
          connection: {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
          },
        };
      },
    }),

    RedisModule,
    CloudinaryModule,
    UsersModule,
    AuthModule,
    MailModule,
    PaymentsModule,
    NovelsModule,
    ChaptersModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
