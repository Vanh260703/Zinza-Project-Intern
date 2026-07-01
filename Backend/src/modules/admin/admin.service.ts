import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';
import { PaymentOrder } from 'src/modules/payments/entities/payment-order.entity';
import { ChapterPurchase } from 'src/modules/payments/entities/chapter-purchase.entity';
import { CandyPackage } from 'src/modules/payments/entities/candy-package.entity';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { WalletTransaction } from 'src/modules/payments/entities/wallet-transaction.entity';
import { TransactionType } from 'src/modules/payments/enums/transaction-type.enum';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { NotificationType } from 'src/modules/notifications/enums/notification-type.enum';
import { QueryUsersDto } from './dto/query-users.dto';
import { TopupCandyDto } from './dto/topup-candy.dto';
import { CreateCandyPackageDto } from './dto/create-candy-package.dto';
import { UpdateCandyPackageDto } from './dto/update-candy-package.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(PaymentOrder)
    private readonly orderRepository: Repository<PaymentOrder>,
    @InjectRepository(ChapterPurchase)
    private readonly chapterPurchaseRepository: Repository<ChapterPurchase>,
    @InjectRepository(CandyPackage)
    private readonly candyPackageRepository: Repository<CandyPackage>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: Repository<WalletTransaction>,
  ) {}

  async getStats() {
    const [totalUsers, totalStories, totalChapters, revenueResult] =
      await Promise.all([
        this.userRepository.count(),
        this.novelRepository.count(),
        this.chapterRepository.count(),
        this.transactionRepository
          .createQueryBuilder('t')
          .select('SUM(ABS(t.amount))', 'totalCandyCirculated')
          .getRawOne<{ totalCandyCirculated: string }>(),
      ]);

    return {
      totalUsers,
      totalStories,
      totalChapters,
      totalCandyCirculated:
        parseInt(revenueResult?.totalCandyCirculated ?? '0') || 0,
    };
  }

  async getUsers(dto: QueryUsersDto) {
    const { q, page = 1, limit = 20 } = dto;

    const qb = this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.email',
        'u.name',
        'u.role',
        'u.gender',
        'u.avatarUrl',
        'u.chaptersRead',
        'u.recommendationTicket',
        'u.joinedAt',
      ])
      .orderBy('u.joinedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (q) {
      qb.where('u.name ILIKE :q OR u.email ILIKE :q', { q: `%${q}%` });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.email',
        'u.name',
        'u.role',
        'u.gender',
        'u.avatarUrl',
        'u.chaptersRead',
        'u.recommendationTicket',
        'u.dailyReadCount',
        'u.joinedAt',
      ])
      .where('u.id = :id', { id })
      .getOne();

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const unlockedChapters = await this.chapterPurchaseRepository.countBy({
      user: { id },
    });

    return { ...user, unlockedChapters };
  }

  async topupCandy(userId: string, dto: TopupCandyDto) {
    return this.dataSource.transaction(async (em) => {
      const wallet = await em.findOne(UserWallet, {
        where: { user: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Ví người dùng không tồn tại');

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + dto.amount;

      await em.update(UserWallet, wallet.id, {
        balance: balanceAfter,
        totalDeposited: wallet.totalDeposited + dto.amount,
      });

      await em.save(
        em.create(WalletTransaction, {
          user: { id: userId },
          type: TransactionType.BONUS,
          amount: dto.amount,
          balanceBefore,
          balanceAfter,
          referenceType: 'admin_topup',
          description: dto.note ?? `Admin cộng ${dto.amount} kẹo`,
        }),
      );

      // Tạo thông báo sau khi topup
      await em.save(
        em.create(Notification, {
          user: { id: userId },
          type: NotificationType.SYSTEM,
          title: 'Bạn vừa nhận được kẹo',
          content: dto.note ?? `Admin đã cộng ${dto.amount} kẹo vào ví của bạn`,
          metadata: { amount: dto.amount, balanceAfter },
        }),
      );

      return { balanceBefore, balanceAfter, amount: dto.amount };
    });
  }

  async getCandyPackages(page: number = 1, limit: number = 10) {
    const [data, total] = await this.candyPackageRepository.findAndCount({
      order: { price: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateCandyPackage(id: string, dto: UpdateCandyPackageDto) {
    const pkg = await this.candyPackageRepository.findOneBy({ id });
    if (!pkg) throw new NotFoundException('Gói kẹo không tồn tại');

    if (dto.price !== undefined && dto.price !== pkg.price) {
      const conflict = await this.candyPackageRepository.existsBy({
        price: dto.price,
      });
      if (conflict)
        throw new ConflictException('Gói kẹo với mệnh giá này đã tồn tại');
    }

    Object.assign(pkg, dto);
    return this.candyPackageRepository.save(pkg);
  }

  async deleteCandyPackage(id: string) {
    const result = await this.candyPackageRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Gói kẹo không tồn tại');
    return { message: 'Xoá gói kẹo thành công' };
  }

  async createCandyPackage(dto: CreateCandyPackageDto) {
    const exists = await this.candyPackageRepository.existsBy({
      price: dto.price,
    });
    if (exists)
      throw new ConflictException('Gói kẹo với mệnh giá này đã tồn tại');

    const pkg = this.candyPackageRepository.create(dto);
    return this.candyPackageRepository.save(pkg);
  }
}
