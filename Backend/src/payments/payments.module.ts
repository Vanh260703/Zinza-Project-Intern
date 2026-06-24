import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { UserWallet } from './entities/user-wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserWallet])],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
