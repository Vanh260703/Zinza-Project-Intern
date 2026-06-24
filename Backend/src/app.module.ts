import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './common/redis';

// Entities
import { User } from './users/entities/user.entity';
import { UserNovelRead } from './users/entities/user-novel-read.entity';
import { UserDailyRead } from './users/entities/user-daily-read.entity';
import { UserNovelBookMark } from './users/entities/user-novel-bookmark.entity';
import { Novel } from './novels/entities/novel.entity';
import { NovelCategory } from './novels/entities/novel-category.entity';
import { NovelTag } from './novels/entities/novel-tag.entity';
import { NovelRating } from './novels/entities/novel-rating.entity';
import { NovelComment } from './novels/entities/novel-comment.entity';
import { NovelNomination } from './novels/entities/novel-nomination.entity';
import { Chapter } from './chapters/entities/chapter.entity';
import { Category } from './categories/entities/category.entity';
import { Tag } from './tags/entities/tag.entity';
import { UserWallet } from './payments/entities/user-wallet.entity';
import { PaymentOrder } from './payments/entities/payment-order.entity';
import { WalletTransaction } from './payments/entities/wallet-transaction.entity';
import { ChapterPurchase } from './payments/entities/chapter-purchase.entity';
import { SepayWebhookLog } from './payments/entities/sepay-webhook-log.entity';
import { CandyPackage } from './payments/entities/candy-package.entity';
import { Notification } from './notifications/entities/notification.entity';
import { MailModule } from './mail/mail.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaymentsModule } from './payments/payments.module';
import { NovelsModule } from './novels/novels.module';

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
          NovelComment,
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
        ],
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // window 60 giây
        limit: 100, // tối đa 100 request / 60s / IP
      },
    ]),

    RedisModule,
    CloudinaryModule,
    UsersModule,
    AuthModule,
    MailModule,
    PaymentsModule,
    NovelsModule,
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
