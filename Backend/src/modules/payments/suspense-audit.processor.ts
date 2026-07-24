import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bullmq';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import { SepayWebhookLog } from './entities/sepay-webhook-log.entity';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { SuspenseReason } from './enums/suspense-reason.enum';
import { TransactionType } from './enums/transaction-type.enum';
import { SuspenseService } from './suspense.service';
import { Novel } from 'src/modules/novels/entities/novel.entity';

export const SUSPENSE_AUDIT_QUEUE = 'suspense-audit';

const PROCESSING_ERROR_SWEEP_JOB = 'processing-error-sweep';
const LEDGER_MISMATCH_AUDIT_JOB = 'ledger-mismatch-audit';

// SePay retry tối đa 5 giờ kể từ lần đầu thất bại, cộng thêm 30 phút
// để chắc chắn webhook không retry lại
const SEPAY_MAX_RETRY_WINDOW_MS = (5 * 60 + 30) * 60 * 1000;

@Processor(SUSPENSE_AUDIT_QUEUE)
export class SuspenseAuditProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(SuspenseAuditProcessor.name);

  constructor(
    @InjectQueue(SUSPENSE_AUDIT_QUEUE) private readonly queue: Queue,
    @InjectRepository(SepayWebhookLog)
    private readonly webhookLogRepository: Repository<SepayWebhookLog>,
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
    private readonly suspenseService: SuspenseService,
  ) {
    super();
  }

  // upsert — an toàn khi gọi lại mỗi lần app restart, không tạo lịch lặp trùng
  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      PROCESSING_ERROR_SWEEP_JOB,
      { pattern: '0 * * * *' }, // mỗi giờ, phút 0
      { name: PROCESSING_ERROR_SWEEP_JOB },
    );
    await this.queue.upsertJobScheduler(
      LEDGER_MISMATCH_AUDIT_JOB,
      { pattern: '0 8 * * *' }, // mỗi 8h sáng
      { name: LEDGER_MISMATCH_AUDIT_JOB },
    );
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case PROCESSING_ERROR_SWEEP_JOB:
        return this.sweepProcessingErrors();
      case LEDGER_MISMATCH_AUDIT_JOB:
        // Chạy tuần tự
        await this.auditBalanceSumMismatch();
        await this.auditMissingPairedTransactions();
        await this.auditBalanceChainMismatch();
        return;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  // Quét webhook bị crash (log.errorMessage có giá trị, chưa isProcessed) và
  // đã quá thời gian SePay có thể retry — coi như thực sự bị kẹt, cần admin xem.
  private async sweepProcessingErrors(): Promise<void> {
    const staleBefore = new Date(Date.now() - SEPAY_MAX_RETRY_WINDOW_MS);

    const staleLogs = await this.webhookLogRepository.find({
      where: {
        isProcessed: false,
        errorMessage: Not(IsNull()),
        createdAt: LessThan(staleBefore),
      },
    });
    if (staleLogs.length === 0) return;

    for (const log of staleLogs) {
      const payload = log.rawPayload as {
        transferAmount?: number;
        content?: string;
      };
      await this.suspenseService.upsertCase({
        caseKey: `sepay:${log.id}`,
        reason: SuspenseReason.PROCESSING_ERROR,
        webhookLog: log,
        amountVnd: payload.transferAmount,
        transferContent: payload.content,
      });
    }

    this.logger.warn(
      `Sweep processing_error: ${staleLogs.length} webhook đang kẹt`,
    );
  }

  // #1 — Đối soát: wallet.balance phải khớp SUM(wallet_transactions.amount).
  private async auditBalanceSumMismatch(): Promise<void> {
    const mismatches = await this.walletRepository
      .createQueryBuilder('w')
      .leftJoin(WalletTransaction, 'wt', 'wt.user_id = w.user_id')
      .select('w.id', 'walletId')
      .addSelect('w.user_id', 'userId')
      .addSelect('w.balance', 'currentBalance')
      .addSelect('COALESCE(SUM(wt.amount), 0)', 'computedBalance')
      .groupBy('w.id')
      .addGroupBy('w.user_id')
      .addGroupBy('w.balance')
      .having('w.balance != COALESCE(SUM(wt.amount), 0)')
      .getRawMany<{
        walletId: string;
        userId: string;
        currentBalance: number;
        computedBalance: string;
      }>();

    for (const m of mismatches) {
      // Tổng cộng dồn của toàn bộ lịch sử giao dịch
      const computedBalance = Number(m.computedBalance);
      await this.suspenseService.upsertCase({
        caseKey: `balance_sum_mismatch:${m.walletId}`,
        reason: SuspenseReason.BALANCE_SUM_MISMATCH,
        affectedUserId: m.userId,
        amountCandy: m.currentBalance - computedBalance,
        details: {
          walletId: m.walletId,
          currentBalance: m.currentBalance,
          computedBalance,
        },
      });
    }

    if (mismatches.length > 0) {
      this.logger.warn(
        `Đối soát balance_sum: ${mismatches.length} ví đang lệch`,
      );
    }
  }

  // #2 — Đối soát: mỗi GIFT (referenceType='novel') phải có đúng 1 EARN tương
  // ứng. amount lưu GIFT là số âm, EARN là số dương (cùng 1 giá trị amount gốc
  // khi tạo cặp) nên tổng gifted = tổng earned nếu không thiếu dòng nào.
  private async auditMissingPairedTransactions(): Promise<void> {
    const mismatches = await this.walletRepository.manager
      .createQueryBuilder(WalletTransaction, 'wt')
      .leftJoin(Novel, 'novel', 'novel.id::text = wt.referenceId')
      .select('wt.referenceId', 'novelId')
      .addSelect('novel.postedBy', 'authorId')
      .addSelect('COUNT(*) FILTER (WHERE wt.type = :gift)', 'giftCount')
      .addSelect('COUNT(*) FILTER (WHERE wt.type = :earn)', 'earnCount')
      .addSelect(
        'COALESCE(SUM(CASE WHEN wt.type = :gift THEN -wt.amount ELSE 0 END), 0)',
        'totalGifted',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN wt.type = :earn THEN wt.amount ELSE 0 END), 0)',
        'totalEarned',
      )
      .where('wt.referenceType = :refType', { refType: 'novel' })
      .setParameter('gift', TransactionType.GIFT)
      .setParameter('earn', TransactionType.EARN)
      .groupBy('wt.referenceId')
      .addGroupBy('novel.postedBy')
      .having('novel.postedBy IS NOT NULL')
      .andHaving(
        'COUNT(*) FILTER (WHERE wt.type = :gift) != COUNT(*) FILTER (WHERE wt.type = :earn)',
      )
      .getRawMany<{
        novelId: string;
        authorId: string;
        giftCount: string;
        earnCount: string;
        totalGifted: string;
        totalEarned: string;
      }>();

    for (const m of mismatches) {
      const missingAmount = Number(m.totalGifted) - Number(m.totalEarned);
      await this.suspenseService.upsertCase({
        caseKey: `missing_pair:${m.novelId}`,
        reason: SuspenseReason.MISSING_PAIR,
        affectedUserId: m.authorId,
        amountCandy: missingAmount,
        details: {
          novelId: m.novelId,
          giftCount: Number(m.giftCount),
          earnCount: Number(m.earnCount),
        },
      });
    }

    if (mismatches.length > 0) {
      this.logger.warn(
        `Đối soát missing_pair: ${mismatches.length} novel đang lệch GIFT/EARN`,
      );
    }
  }

  // #3 — Đối soát: với mỗi ví, balanceBefore của 1 giao dịch phải khớp đúng
  // balanceAfter của giao dịch liền trước nó (theo thời gian).
  private async auditBalanceChainMismatch(): Promise<void> {
    // Lấy ra những bản ghi chênh lệch giữa dòng tiền của giao dịch liền trước
    const breaks: Array<{
      userId: string;
      walletId: string;
      transactionId: string;
      balanceBefore: number;
      prevBalanceAfter: number;
    }> = await this.walletRepository.manager.query(`
      SELECT "userId", "walletId", "transactionId", "balanceBefore", "prevBalanceAfter"
      FROM (
        SELECT
          wt.user_id AS "userId",
          uw.id AS "walletId",
          wt.id AS "transactionId",
          wt."balanceBefore" AS "balanceBefore",
          LAG(wt."balanceAfter") OVER (
            PARTITION BY wt.user_id ORDER BY wt."createdAt", wt.id
          ) AS "prevBalanceAfter"
        FROM wallet_transactions wt
        JOIN user_wallets uw ON uw.user_id = wt.user_id
      ) chained
      WHERE "prevBalanceAfter" IS NOT NULL AND "balanceBefore" != "prevBalanceAfter"
    `);

    const breaksByWallet = new Map<string, typeof breaks>();
    for (const b of breaks) {
      // Map các bản ghi theo walletId
      const list = breaksByWallet.get(b.walletId) ?? [];
      list.push(b);
      breaksByWallet.set(b.walletId, list);
    }

    for (const [walletId, walletBreaks] of breaksByWallet) {
      await this.suspenseService.upsertCase({
        caseKey: `balance_chain_mismatch:${walletId}`,
        reason: SuspenseReason.BALANCE_CHAIN_MISMATCH,
        affectedUserId: walletBreaks[0].userId,
        details: {
          walletId,
          brokenTransactionIds: walletBreaks.map((b) => b.transactionId),
        },
      });
    }

    if (breaksByWallet.size > 0) {
      this.logger.warn(
        `Đối soát balance_chain: ${breaksByWallet.size} ví đang đứt chuỗi`,
      );
    }
  }
}
