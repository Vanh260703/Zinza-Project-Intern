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
import { UserStoryRead } from './users/entities/user-story-read.entity';
import { UserDailyRead } from './users/entities/user-daily-read.entity';
import { UserStoryBookMark } from './users/entities/user-story-bookmark.entity';
import { Story } from './stories/entities/story.entity';
import { StoryCategory } from './stories/entities/story-category.entity';
import { StoryTag } from './stories/entities/story-tag.entity';
import { StoryRating } from './stories/entities/story-rating.entity';
import { StoryComment } from './stories/entities/story-comment.entity';
import { StoryNomination } from './stories/entities/story-nomination.entity';
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
          UserStoryRead,
          UserDailyRead,
          UserStoryBookMark,
          Story,
          StoryCategory,
          StoryTag,
          StoryRating,
          StoryComment,
          StoryNomination,
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
    UsersModule,
    AuthModule,
    MailModule,
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
