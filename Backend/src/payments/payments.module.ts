import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Novel } from 'src/novels/entities/novel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserWallet, WalletTransaction, Novel])],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
