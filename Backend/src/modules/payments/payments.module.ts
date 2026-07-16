import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SuspenseService } from './suspense.service';
import {
  SuspenseAuditProcessor,
  SUSPENSE_AUDIT_QUEUE,
} from './suspense-audit.processor';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CandyPackage } from './entities/candy-package.entity';
import { PaymentOrder } from './entities/payment-order.entity';
import { SepayWebhookLog } from './entities/sepay-webhook-log.entity';
import { SuspenseTransaction } from './entities/suspense-transaction.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserWallet,
      WalletTransaction,
      CandyPackage,
      PaymentOrder,
      SepayWebhookLog,
      SuspenseTransaction,
      Novel,
    ]),
    NotificationsModule,
    BullModule.registerQueue({ name: SUSPENSE_AUDIT_QUEUE }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, SuspenseService, SuspenseAuditProcessor],
  exports: [PaymentsService, SuspenseService],
})
export class PaymentsModule {}
