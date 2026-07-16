import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UserNovelBookMark } from 'src/modules/users/entities/user-novel-bookmark.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { Status } from 'src/modules/novels/enums';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';
import { PaymentOrder } from 'src/modules/payments/entities/payment-order.entity';
import { ChapterPurchase } from 'src/modules/payments/entities/chapter-purchase.entity';
import { CandyPackage } from 'src/modules/payments/entities/candy-package.entity';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { WalletTransaction } from 'src/modules/payments/entities/wallet-transaction.entity';
import { SuspenseTransaction } from 'src/modules/payments/entities/suspense-transaction.entity';
import { TransactionType } from 'src/modules/payments/enums/transaction-type.enum';
import { SuspenseStatus } from 'src/modules/payments/enums/suspense-status.enum';
import { SuspenseReason } from 'src/modules/payments/enums/suspense-reason.enum';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { NotificationType } from 'src/modules/notifications/enums/notification-type.enum';
import { QueryUsersDto } from './dto/query-users.dto';
import { TopupCandyDto } from './dto/topup-candy.dto';
import { CreateCandyPackageDto } from './dto/create-candy-package.dto';
import { UpdateCandyPackageDto } from './dto/update-candy-package.dto';
import { QuerySuspenseTransactionsDto } from './dto/query-suspense-transactions.dto';
import { ResolveSuspenseTransactionDto } from './dto/resolve-suspense-transaction.dto';

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
    @InjectRepository(UserNovelBookMark)
    private readonly bookmarkRepository: Repository<UserNovelBookMark>,
    @InjectRepository(SuspenseTransaction)
    private readonly suspenseRepository: Repository<SuspenseTransaction>,
  ) {}

  async getStats() {
    const [
      totalUsers,
      totalNovels,
      totalChapters,
      revenueResult,
      vipNovels,
      pending,
      completed,
      recentUsers,
      recentNovels,
    ] = await Promise.all([
      this.userRepository.count(),
      this.novelRepository.count(),
      this.chapterRepository.count(),
      this.transactionRepository
        .createQueryBuilder('t')
        .select('SUM(ABS(t.amount))', 'total')
        .getRawOne<{ total: string }>(),
      this.novelRepository.countBy({ vip: true }),
      this.novelRepository.countBy({ status: Status.PENDING }),
      this.novelRepository.countBy({ status: Status.COMPLETED }),
      this.userRepository.find({
        select: ['id', 'name', 'email', 'role', 'joinedAt'],
        order: { joinedAt: 'DESC' },
        take: 5,
      }),
      this.novelRepository.find({
        select: [
          'id',
          'slug',
          'name',
          'author',
          'status',
          'chapterCount',
          'vip',
          'poster',
          'updatedAt',
        ],
        order: { updatedAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      totalNovels,
      totalChapters,
      totalCandy: parseInt(revenueResult?.total ?? '0') || 0,
      vipNovels,
      novelsByStatus: { pending, completed },
      recentUsers,
      recentNovels: recentNovels.map(({ poster, ...rest }) => ({
        ...rest,
        posterUrl: poster ?? null,
      })),
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

    const wallets = await this.walletRepository.find({
      where: { user: { id: In(data.map((u) => u.id)) } },
      relations: { user: true },
    });
    const candyMap = new Map(wallets.map((w) => [w.user.id, w.balance]));
    const withCandy = data.map((u) => ({
      ...u,
      candy: candyMap.get(u.id) ?? 0,
    }));

    return {
      data: withCandy,
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

    const [wallet, unlockedChapters, bookmarksCount] = await Promise.all([
      this.walletRepository.findOne({ where: { user: { id } } }),
      this.chapterPurchaseRepository.countBy({ user: { id } }),
      this.bookmarkRepository.countBy({ user: { id } }),
    ]);

    return {
      ...user,
      candy: wallet?.balance ?? 0,
      unlockedChapters,
      bookmarksCount,
    };
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

  async getSuspenseTransactions(dto: QuerySuspenseTransactionsDto) {
    const { status, reason, page = 1, limit = 20 } = dto;

    const [data, total] = await this.suspenseRepository.findAndCount({
      where: {
        ...(status ? { status } : {}),
        ...(reason ? { reason } : {}),
      },
      relations: { affectedUser: true },
      select: {
        affectedUser: { id: true, name: true, email: true },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async resolveSuspenseTransaction(
    id: string,
    adminId: string,
    dto: ResolveSuspenseTransactionDto,
  ) {
    const { suspense, creditedTransaction, creditUserId, creditAmount } =
      await this.dataSource.transaction(async (em) => {
        // Lock trước, KHÔNG kèm relation — Postgres không cho FOR UPDATE áp
        // dụng lên phía nullable của LEFT JOIN (affectedUser nullable)
        const locked = await em.findOne(SuspenseTransaction, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!locked)
          throw new NotFoundException('Suspense transaction không tồn tại');
        if (locked.status !== SuspenseStatus.UNRESOLVED)
          throw new ConflictException(
            'Suspense transaction đã được xử lý trước đó',
          );

        const suspense = (await em.findOne(SuspenseTransaction, {
          where: { id },
          relations: { affectedUser: true },
          select: {
            affectedUser: { id: true, name: true, email: true },
          },
        }))!;

        let creditUserId: string | undefined;
        let creditAmount: number | undefined;
        // missing_pair: hệ thống đã tự tính được số kẹo cần tặng và tác giả sẽ nhận kẹo
        if (suspense.reason === SuspenseReason.MISSING_PAIR) {
          creditUserId = suspense.affectedUser?.id;
          creditAmount = suspense.amountCandy ?? undefined;
        } else if (
          // 2 case này sẽ chỉ xử lý mà không cần thêm kẹo
          suspense.reason !== SuspenseReason.BALANCE_SUM_MISMATCH &&
          suspense.reason !== SuspenseReason.BALANCE_CHAIN_MISMATCH
        ) {
          // Chỉ 6 case của sePay thì mới cho phép nhập tay
          creditUserId = dto.creditUserId;
          creditAmount = dto.creditAmount;
        }

        // Chỉ cộng kẹo khi xác định rõ user + số lượng — không phải mọi lần
        // resolve đều cần cộng bù (vd mismatch benign, hoặc refund tay qua
        // ngân hàng)
        const creditedTransaction =
          creditUserId && creditAmount
            ? await (async (uid: string, amount: number) => {
                const wallet = await em.findOne(UserWallet, {
                  where: { user: { id: uid } },
                  lock: { mode: 'pessimistic_write' },
                });
                if (!wallet)
                  throw new NotFoundException('Ví người dùng không tồn tại');

                const balanceBefore = wallet.balance;
                const balanceAfter = balanceBefore + amount;

                await em.update(UserWallet, wallet.id, {
                  balance: balanceAfter,
                });

                // missing_pair: backfill phải là EARN + referenceType='novel' +
                // referenceId=novelId để trùng đúng điều kiện query của
                // auditMissingPairedTransactions — nếu không sẽ bị coi là vẫn
                // còn thiếu và tạo suspense mới vào mỗi cron
                const novelId =
                  suspense.reason === SuspenseReason.MISSING_PAIR
                    ? (suspense.details?.novelId as string | undefined)
                    : undefined;

                return em.save(
                  em.create(WalletTransaction, {
                    user: { id: uid },
                    type: novelId
                      ? TransactionType.EARN
                      : TransactionType.BONUS,
                    amount,
                    balanceBefore,
                    balanceAfter,
                    referenceType: novelId ? 'novel' : 'suspense_transaction',
                    referenceId: novelId ?? suspense.id,
                    description: `Admin cộng bù kẹo từ suspense: ${dto.resolutionNote}`,
                  }),
                );
              })(creditUserId, creditAmount)
            : null;

        suspense.status = dto.status;
        suspense.resolutionNote = dto.resolutionNote;
        suspense.resolvedBy = { id: adminId } as User;
        suspense.resolvedAt = new Date();
        if (creditedTransaction)
          suspense.creditedWalletTransaction = creditedTransaction;

        await em.save(suspense);

        return { suspense, creditedTransaction, creditUserId, creditAmount };
      });

    if (creditedTransaction && creditUserId) {
      try {
        await this.notificationRepository.save(
          this.notificationRepository.create({
            user: { id: creditUserId },
            type: NotificationType.SYSTEM,
            title: 'Bạn vừa nhận được kẹo',
            content: `Admin đã cộng ${creditAmount} kẹo vào ví của bạn`,
            metadata: { amount: creditAmount },
          }),
        );
      } catch {
        // Không fail việc resolve nếu tạo thông báo lỗi
      }
    }

    return suspense;
  }
}
