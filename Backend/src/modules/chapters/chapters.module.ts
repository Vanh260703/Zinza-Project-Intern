import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { Chapter } from './entities/chapter.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { ChapterPurchase } from 'src/modules/payments/entities/chapter-purchase.entity';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { WalletTransaction } from 'src/modules/payments/entities/wallet-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chapter,
      Novel,
      ChapterPurchase,
      UserWallet,
      WalletTransaction,
    ]),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
