import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { Novel } from 'src/modules/novels/entities/novel.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
  ) {}

  async getWallet(userId: string): Promise<UserWallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async giftCandy(
    userId: string,
    novel: Novel,
    amount: number,
  ): Promise<{ message: string; remainingBalance: number }> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) throw new NotFoundException('Ví không tồn tại');
    if (wallet.balance < amount)
      throw new BadRequestException('Số dư không đủ');

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    await this.walletRepository.update(wallet.id, {
      balance: balanceAfter,
      totalSpent: wallet.totalSpent + amount,
    });
    await this.novelRepository.increment(
      { id: novel.id },
      'candyReceived',
      amount,
    );
    await this.transactionRepository.save(
      this.transactionRepository.create({
        user: { id: userId },
        type: TransactionType.GIFT,
        amount: -amount,
        balanceBefore,
        balanceAfter,
        referenceType: 'novel',
        referenceId: novel.id,
        description: `Tặng ${amount} kẹo cho truyện "${novel.name}"`,
      }),
    );

    return { message: 'Tặng kẹo thành công', remainingBalance: balanceAfter };
  }
}
