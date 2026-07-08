import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CandyPackage } from './entities/candy-package.entity';
import { PaymentOrder } from './entities/payment-order.entity';
import { SepayWebhookLog } from './entities/sepay-webhook-log.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserWallet,
      WalletTransaction,
      CandyPackage,
      PaymentOrder,
      SepayWebhookLog,
      Novel,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
