import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { SepayWebhookLog } from './sepay-webhook-log.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { SuspenseReason } from '../enums/suspense-reason.enum';
import { SuspenseStatus } from '../enums/suspense-status.enum';

// Sổ cái để đối soát dòng tiền chênh lệch & lỗi đến từ sePay
@Entity('suspense_transactions')
export class SuspenseTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Chìa khoá tự nhiên cho 1 vấn đề lặp lại — vd 'balance_sum_mismatch:{walletId}',
  // 'missing_pair:{novelId}', 'sepay:{webhookLogId}'. Audit job/webhook upsert theo
  // đúng 1 dòng — không sinh case mới mỗi lần cron/webhook thấy vẫn còn tồn tại.
  @Index({ unique: true })
  @Column()
  caseKey: string;

  @Column({ type: 'enum', enum: SuspenseReason })
  reason: SuspenseReason;

  @Column({
    type: 'enum',
    enum: SuspenseStatus,
    default: SuspenseStatus.UNRESOLVED,
  })
  status: SuspenseStatus;

  // Chỉ có giá trị với các reason liên quan SePay — null với 3 reason đối soát ledger.
  @ManyToOne(() => SepayWebhookLog, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'webhook_log_id' })
  webhookLog: SepayWebhookLog | null;

  // Số tiền VND thực nhận qua ngân hàng — chỉ có với case SePay.
  @Column({ type: 'int', nullable: true })
  amountVnd: number | null;

  // Số kẹo lệch phát hiện qua audit — chỉ có với 3 reason đối soát ledger.
  @Column({ type: 'int', nullable: true })
  amountCandy: number | null;

  // Nội dung chuyển khoản gốc — admin đọc để tự đoán giao dịch này là của ai.
  @Column({ type: 'text', nullable: true })
  transferContent: string | null;

  // User bị ảnh hưởng nếu đã xác định được (vd ledger mismatch biết rõ ví nào lệch).
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'affected_user_id' })
  affectedUser: User | null;

  // Ngữ cảnh phụ tuỳ theo reason
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolvedBy: User | null;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNote: string | null;

  // Nếu admin quyết định cộng bù kẹo cho user cụ thể khi resolve — link tới bản ghi
  // ví thật đã tạo, giữ liên kết với audit trail chính thay vì tách rời.
  @ManyToOne(() => WalletTransaction, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'credited_wallet_transaction_id' })
  creditedWalletTransaction: WalletTransaction | null;

  // Lúc case được mở lần đầu tiên (khác lastSeenAt — không đổi khi case tái xác nhận).
  @CreateDateColumn()
  createdAt: Date;

  // Lần gần nhất audit/webhook xác nhận case vẫn còn tồn tại (bump mỗi lần upsert
  // chạm vào case này, kể cả khi không đổi số liệu). Admin xem cái này để biết
  // case đã tồn tại/lặp lại bao lâu rồi.
  @Column({ default: () => 'now()' })
  lastSeenAt: Date;
}
