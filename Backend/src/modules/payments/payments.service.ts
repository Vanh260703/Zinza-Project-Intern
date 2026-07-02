import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
  ) {}

  async handleSepayWebhook(
    signature: string | undefined,
    timestamp: string | undefined,
    rawBody: Buffer,
    dto: SepayWebhookDto,
  ) {
    // 1. Xác thực chữ ký HMAC-SHA256
    // SEPAY_SKIP_SIGNATURE=true để bypass khi test bằng simulation tool
    const skipVerify = process.env.SEPAY_SKIP_SIGNATURE === 'true';

    if (!skipVerify) {
      const secret = process.env.SEPAY_SECRET_KEY;
      if (!secret) return { success: false, message: 'Server misconfigured' };

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
        sigBuf.length === expBuf.length &&
        crypto.timingSafeEqual(sigBuf, expBuf);

      if (!isValid) {
        return { success: false, message: 'Invalid signature' };
      }
    }

    // 2. Khởi tạo log — ghi lại mọi request kể cả khi bị ignore
    const log = this.webhookLogRepository.create({
      gatewayTransactionId: String(dto.id),
      rawPayload: dto as unknown as object,
    });

    // 3. Idempotency — bỏ qua nếu transaction này đã xử lý rồi
    // SePay có thể retry nếu không nhận được 200, nên cần check trùng lặp
    const existing = await this.webhookLogRepository.existsBy({
      gatewayTransactionId: String(dto.id),
    });
    if (existing) return { success: true, message: 'Already processed' };

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
      return { success: true, message: 'Payment completed' };
    } catch (err) {
      log.errorMessage = err instanceof Error ? err.message : String(err);
      await this.webhookLogRepository.save(log);
      return { success: true, message: 'Processing error' };
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

  async findOrderById(userId: string, id: string): Promise<PaymentOrder> {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!order) throw new NotFoundException('Order không tồn tại');

    return order;
  }
}
