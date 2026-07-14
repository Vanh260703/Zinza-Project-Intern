import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CandyPackage } from './entities/candy-package.entity';
import { PaymentOrder } from './entities/payment-order.entity';
import { SepayWebhookLog } from './entities/sepay-webhook-log.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { NotificationType } from 'src/modules/notifications/enums/notification-type.enum';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(CandyPackage)
    private readonly candyPackageRepository: Repository<CandyPackage>,
    @InjectRepository(PaymentOrder)
    private readonly orderRepository: Repository<PaymentOrder>,
    @InjectRepository(SepayWebhookLog)
    private readonly webhookLogRepository: Repository<SepayWebhookLog>,
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleSepayWebhook(
    signature: string | undefined,
    timestamp: string | undefined,
    rawBody: Buffer,
    dto: SepayWebhookDto,
  ) {
    // 1. Xác thực chữ ký HMAC-SHA256
    // env validation đảm bảo SEPAY_SECRET_KEY luôn có giá trị khi app khởi động
    const secret = process.env.SEPAY_SECRET_KEY!;

    if (!signature || !timestamp) {
      return { success: false, message: 'Missing signature headers' };
    }

    // Reject request cũ hơn 5 phút để chống replay attack
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
      return { success: false, message: 'Timestamp expired' };
    }

    // SePay ký trên chuỗi "${timestamp}.${body}" (không chỉ body)
    const body = rawBody.toString('utf8');
    const expected =
      'sha256=' +
      crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${body}`)
        .digest('hex');

    // timingSafeEqual tránh timing attack — yêu cầu 2 buffer cùng độ dài
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    const isValid =
      sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!isValid) {
      return { success: false, message: 'Invalid signature' };
    }

    // 2. Insert log ngay — unique constraint trên gatewayTransactionId làm "lock" tự nhiên.
    // Nếu 2 request đến đồng thời, chỉ 1 insert thành công; request kia nhảy vào catch.
    let log: SepayWebhookLog;
    try {
      log = await this.webhookLogRepository.save(
        this.webhookLogRepository.create({
          gatewayTransactionId: String(dto.id),
          rawPayload: dto as unknown as object,
        }),
      );
    } catch {
      // 3. Idempotency — duplicate key: phân biệt "đã xử lý thành công" vs "lần trước bị lỗi".
      const existing = await this.webhookLogRepository.findOneBy({
        gatewayTransactionId: String(dto.id),
      });
      if (!existing || existing.isProcessed) {
        return { success: true, message: 'Already processed' };
      }
      // Lần trước bị lỗi → reuse log cũ, tiếp tục xử lý
      log = existing;
    }

    // 4. Lọc giao dịch hợp lệ
    // Chỉ xử lý tiền vào (transferType = 'in') và phải có nội dung CK (code)
    if (dto.transferType !== 'in' || !dto.code) {
      log.errorMessage = 'Ignored: transferType out or no code';
      await this.webhookLogRepository.save(log);
      return { success: true, message: 'Ignored' };
    }

    // 5. Tìm order theo orderCode trong nội dung chuyển khoản
    const order = await this.orderRepository.findOne({
      where: { orderCode: dto.code },
      relations: { user: true },
      select: {
        id: true,
        orderCode: true,
        status: true,
        expiredAt: true,
        amountVnd: true,
        candyAmount: true,
        user: { id: true },
      },
    });

    if (!order) {
      log.errorMessage = `Order not found: ${dto.code}`;
      await this.webhookLogRepository.save(log);
      return { success: true, message: 'Order not found' };
    }

    log.paymentOrder = order;

    // 6. Kiểm tra trạng thái & thời hạn order
    if (order.status !== PaymentStatus.PENDING) {
      log.errorMessage = `Order already ${order.status}`;
      await this.webhookLogRepository.save(log);
      return { success: true, message: 'Order not pending' };
    }

    if (new Date() > order.expiredAt) {
      await this.orderRepository.update(order.id, {
        status: PaymentStatus.EXPIRED,
      });
      log.errorMessage = 'Order expired';
      await this.webhookLogRepository.save(log);
      return { success: true, message: 'Order expired' };
    }

    // Số tiền thực chuyển phải khớp chính xác với order để tránh underpay
    if (dto.transferAmount !== order.amountVnd) {
      log.errorMessage = `Amount mismatch: got ${dto.transferAmount}, expected ${order.amountVnd}`;
      await this.webhookLogRepository.save(log);
      return { success: true, message: 'Amount mismatch' };
    }

    // 7. Cộng kẹo vào ví — toàn bộ trong 1 transaction DB
    try {
      await this.dataSource.transaction(async (em) => {
        // Đánh dấu order hoàn thành
        await em.update(PaymentOrder, order.id, {
          status: PaymentStatus.COMPLETED,
          sepayTransactionId: String(dto.id),
          paidAt: new Date(),
        });

        // Pessimistic lock để tránh race condition nếu 2 webhook đến đồng thời
        const wallet = await em.findOne(UserWallet, {
          where: { user: { id: order.user.id } },
          lock: { mode: 'pessimistic_write' },
        });
        if (!wallet) throw new Error('Wallet not found');

        const balanceBefore = wallet.balance;
        const balanceAfter = balanceBefore + order.candyAmount;

        await em.update(UserWallet, wallet.id, {
          balance: balanceAfter,
          totalDeposited: wallet.totalDeposited + order.amountVnd,
        });

        // Ghi lịch sử giao dịch để user xem lại
        await em.save(
          em.create(WalletTransaction, {
            user: { id: order.user.id },
            type: TransactionType.TOPUP,
            amount: order.candyAmount,
            balanceBefore,
            balanceAfter,
            referenceType: 'payment_order',
            referenceId: order.id,
            description: `Nạp ${order.amountVnd.toLocaleString('vi-VN')}đ — nhận ${order.candyAmount} kẹo`,
          }),
        );
      });

      log.isProcessed = true;
      log.processedAt = new Date();
      await this.webhookLogRepository.save(log);

      // Thông báo sau khi đã xử lý xong — không để lỗi ở đây làm webhook báo fail
      // (SePay sẽ retry dù tiền đã cộng xong, gây khó hiểu).
      try {
        await this.notificationsService.create({
          userId: order.user.id,
          type: NotificationType.PAYMENT_SUCCESS,
          title: 'Nạp kẹo thành công',
          content: `Bạn đã nạp thành công ${order.candyAmount.toLocaleString('vi-VN')} kẹo (${order.amountVnd.toLocaleString('vi-VN')}đ).`,
          referenceType: 'payment_order',
          referenceId: order.id,
        });
      } catch {
        // bỏ qua — thanh toán đã xử lý xong, không chặn vì lỗi thông báo
      }

      return { success: true, message: 'Payment completed' };
    } catch (err) {
      log.errorMessage = err instanceof Error ? err.message : String(err);
      await this.webhookLogRepository.save(log);
      // Trả success:false để SePay retry — lần retry sẽ reuse log này (isProcessed=false).
      // Chỉ trả success:true khi thực sự xử lý xong ở trên.
      return { success: false, message: 'Processing error' };
    }
  }

  async createOrder(userId: string, dto: CreatePaymentOrderDto) {
    const pkg = await this.candyPackageRepository.findOneBy({
      id: dto.packageId,
      isActive: true,
    });
    if (!pkg)
      throw new NotFoundException('Gói kẹo không tồn tại hoặc đã ngừng bán');

    const PRIME_DIGITS = '2357';
    const suffix = Array.from(
      crypto.randomBytes(6),
      (b) => PRIME_DIGITS[b % 4],
    ).join('');
    const orderCode = 'NK' + suffix;
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        user: { id: userId },
        candyPackage: { id: pkg.id },
        orderCode,
        amountVnd: pkg.price,
        candyAmount: pkg.candy + pkg.bonus,
        expiredAt,
      }),
    );

    const qrUrl =
      `https://vietqr.app/img` +
      `?bank=${process.env.BANK_ID}` +
      `&acc=${process.env.BANK_ACCOUNT_NO}` +
      `&template=compact` +
      `&amount=${pkg.price}` +
      `&addInfo=${orderCode}`;

    return {
      orderId: order.id,
      orderCode,
      amountVnd: order.amountVnd,
      candyAmount: order.candyAmount,
      expiredAt: order.expiredAt,
      qrUrl,
    };
  }

  getCandyPackages() {
    return this.candyPackageRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

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
    gifterName: string,
  ): Promise<{ message: string; remainingBalance: number }> {
    // Không cho tặng kẹo cho truyện của chính mình
    if (novel.postedBy?.id === userId) {
      throw new BadRequestException(
        'Không thể tặng kẹo cho truyện của chính mình',
      );
    }

    const result = await this.dataSource.transaction(async (em) => {
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

      // Cộng kẹo vào ví người đăng truyện (postedBy có thể null nếu người đăng đã bị xoá)
      if (novel.postedBy) {
        await this.creditAuthorWallet(
          em,
          novel.postedBy.id,
          amount,
          'novel',
          novel.id,
          `Nhận ${amount} kẹo từ truyện "${novel.name}"`,
        );
      }

      return { remainingBalance: balanceAfter };
    });

    // Thông báo sau khi transaction đã commit — không chặn/làm fail giao dịch chính
    try {
      const notifications = [
        {
          userId,
          type: NotificationType.GIFT_CANDY,
          title: 'Tặng kẹo thành công',
          content: `Bạn đã tặng ${amount} kẹo cho truyện "${novel.name}"`,
          referenceType: 'novel',
          referenceId: novel.id,
        },
      ];
      if (novel.postedBy) {
        notifications.push({
          userId: novel.postedBy.id,
          type: NotificationType.GIFT_CANDY,
          title: 'Bạn vừa được tặng kẹo',
          content: `${gifterName} đã tặng ${amount} kẹo cho truyện "${novel.name}"`,
          referenceType: 'novel',
          referenceId: novel.id,
        });
      }
      await this.notificationsService.createMany(notifications);
    } catch {
      // Không fail giao dịch tặng kẹo nếu tạo thông báo lỗi
    }

    return {
      message: 'Tặng kẹo thành công',
      remainingBalance: result.remainingBalance,
    };
  }

  // Cộng kẹo cho ví người đăng + ghi lịch sử EARN. Dùng increment atomic (không lock
  // ví người nhận) để tránh deadlock khi có nhiều giao dịch cùng lúc.
  private async creditAuthorWallet(
    em: EntityManager,
    authorId: string,
    amount: number,
    referenceType: string,
    referenceId: string,
    description: string,
  ): Promise<void> {
    const authorWallet = await em.findOne(UserWallet, {
      where: { user: { id: authorId } },
    });
    if (!authorWallet) return;

    await em.increment(UserWallet, { id: authorWallet.id }, 'balance', amount);
    await em.save(
      em.create(WalletTransaction, {
        user: { id: authorId },
        type: TransactionType.EARN,
        amount,
        balanceBefore: authorWallet.balance,
        balanceAfter: authorWallet.balance + amount,
        referenceType,
        referenceId,
        description,
      }),
    );
  }

  async findOrderById(userId: string, id: string): Promise<PaymentOrder> {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!order) throw new NotFoundException('Order không tồn tại');

    return order;
  }

  async getUserTransactions(userId: string, dto: QueryTransactionsDto) {
    const { type, from, to, page = 1, limit = 20 } = dto;

    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .where('t.user_id = :userId', { userId })
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (type) {
      qb.andWhere('t.type = :type', { type });
    }
    if (from) {
      qb.andWhere('t.createdAt >= :from', { from: new Date(from) });
    }
    if (to) {
      // Lấy hết ngày `to` — nếu không cộng thêm sẽ bị hiểu là 00:00:00, loại mất cả ngày đó
      const toDate = new Date(`${to}T23:59:59.999`);
      qb.andWhere('t.createdAt <= :to', { to: toDate });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
