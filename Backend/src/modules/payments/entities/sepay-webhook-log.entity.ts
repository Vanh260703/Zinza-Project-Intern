import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentOrder } from './payment-order.entity';

@Entity('sepay_webhook_logs')
export class SepayWebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID giao dịch từ SePay — UNIQUE để chống xử lý trùng (idempotency)
  // SePay có thể gửi cùng 1 webhook nhiều lần khi network lỗi
  @Column({ unique: true })
  gatewayTransactionId: string;

  // null nếu không tìm được đơn hàng khớp với orderCode trong nội dung CK
  @ManyToOne(() => PaymentOrder, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'payment_order_id' })
  paymentOrder: PaymentOrder;

  // Raw payload từ SePay — lưu để replay lại nếu có bug trong xử lý
  @Column({ type: 'jsonb' })
  rawPayload: object;

  @Column({ default: false })
  isProcessed: boolean;

  @Column({ nullable: true })
  processedAt: Date;

  // Ghi lỗi nếu xử lý thất bại (VD: đơn đã expired, balance âm...)
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
