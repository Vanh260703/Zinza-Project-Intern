import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuspenseTransaction } from './entities/suspense-transaction.entity';
import { SuspenseReason } from './enums/suspense-reason.enum';
import { SuspenseStatus } from './enums/suspense-status.enum';
import { SepayWebhookLog } from './entities/sepay-webhook-log.entity';

type UpsertCaseParams = {
  caseKey: string;
  reason: SuspenseReason;
  affectedUserId?: string;
  amountVnd?: number;
  amountCandy?: number;
  transferContent?: string;
  webhookLog?: SepayWebhookLog;
  details?: Record<string, unknown>;
};

@Injectable()
export class SuspenseService {
  private readonly logger = new Logger(SuspenseService.name);

  constructor(
    @InjectRepository(SuspenseTransaction)
    private readonly suspenseRepository: Repository<SuspenseTransaction>,
  ) {}

  // Upsert theo caseKey — 1 vấn đề lặp lại (dù phát hiện lại bao nhiêu lần, từ
  // webhook retry hay audit job chạy lại) chỉ giữ đúng 1 dòng suspense.
  //
  //   1. Case chưa từng có -> tạo mới.
  //   2. Case đang UNRESOLVED -> cập nhật số liệu mới nhất + lastSeenAt.
  //   3. Case đã ACCEPTED, số liệu không đổi -> chỉ bump lastSeenAt.
  //   4. Case đã ACCEPTED, số liệu đã đổi khác -> mở lại UNRESOLVED (thông tin mới).
  //   5. Case đã RESOLVED/REFUNDED nhưng vẫn phát hiện lại -> mở lại UNRESOLVED
  //      (case chưa thực sự xong).
  async upsertCase(params: UpsertCaseParams): Promise<void> {
    const existing = await this.suspenseRepository.findOneBy({
      caseKey: params.caseKey,
    });

    if (!existing) {
      await this.suspenseRepository.save(
        this.suspenseRepository.create({
          caseKey: params.caseKey,
          reason: params.reason,
          affectedUser: params.affectedUserId
            ? { id: params.affectedUserId }
            : null,
          amountVnd: params.amountVnd ?? null,
          amountCandy: params.amountCandy ?? null,
          transferContent: params.transferContent ?? null,
          webhookLog: params.webhookLog ?? null,
          details: params.details ?? null,
          lastSeenAt: new Date(),
        }),
      );
      this.logger.warn(`Mở case suspense mới: ${params.caseKey}`);
      return;
    }

    if (existing.status === SuspenseStatus.ACCEPTED) {
      // CASE: đã ACCPETED mà số liệu không đổi -> bump lại lastSeenAt
      const unchanged =
        (existing.amountCandy ?? null) === (params.amountCandy ?? null);
      if (unchanged) {
        existing.lastSeenAt = new Date();
        await this.suspenseRepository.save(existing);
        return;
      }
      // Số liệu đổi khác lúc admin accept -> rơi xuống dưới, mở lại như case mới phát sinh
    } else if (existing.status === SuspenseStatus.UNRESOLVED) {
      existing.amountCandy = params.amountCandy ?? null;
      existing.details = params.details ?? null;
      existing.lastSeenAt = new Date();
      await this.suspenseRepository.save(existing);
      return;
    }

    existing.status = SuspenseStatus.UNRESOLVED;
    existing.amountCandy = params.amountCandy ?? null;
    existing.details = params.details ?? null;
    existing.lastSeenAt = new Date();
    existing.resolvedBy = null;
    existing.resolvedAt = null as unknown as Date;
    existing.resolutionNote = null;
    await this.suspenseRepository.save(existing);
    this.logger.warn(`Mở lại case suspense (vẫn còn lệch): ${params.caseKey}`);
  }
}
