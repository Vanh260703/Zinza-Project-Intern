import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { Novel } from 'src/modules/novels/entities/novel.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,
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
    return this.dataSource.transaction(async (em) => {
      // SELECT ... FOR UPDATE locks the row for this transaction
      const wallet = await em.findOne(UserWallet, {
        where: { user: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Ví không tồn tại');
      if (wallet.balance < amount)
        throw new BadRequestException('Số dư không đủ');

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - amount;

      await em.update(UserWallet, wallet.id, {
        balance: balanceAfter,
        totalSpent: wallet.totalSpent + amount,
      });
      await em.increment(Novel, { id: novel.id }, 'candyReceived', amount);
      await em.save(
        em.create(WalletTransaction, {
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
    });
  }
}
