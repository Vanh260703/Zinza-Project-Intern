import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWallet } from './entities/user-wallet.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
  ) {}

  async getWallet(userId: string): Promise<UserWallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    return wallet;
  }
}
