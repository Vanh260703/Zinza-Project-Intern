import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from 'src/modules/users/entities/user.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';
import { PaymentOrder } from 'src/modules/payments/entities/payment-order.entity';
import { ChapterPurchase } from 'src/modules/payments/entities/chapter-purchase.entity';
import { CandyPackage } from 'src/modules/payments/entities/candy-package.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { WalletTransaction } from 'src/modules/payments/entities/wallet-transaction.entity';
import { SuspenseTransaction } from 'src/modules/payments/entities/suspense-transaction.entity';
import { UserNovelBookMark } from 'src/modules/users/entities/user-novel-bookmark.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Novel,
      Chapter,
      PaymentOrder,
      ChapterPurchase,
      CandyPackage,
      UserWallet,
      WalletTransaction,
      SuspenseTransaction,
      Notification,
      UserNovelBookMark,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
