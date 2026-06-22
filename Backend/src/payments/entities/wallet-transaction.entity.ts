import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TransactionType } from '../enums/transaction-type.enum';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  // Dương (+) = cộng candy (topup/bonus/refund), Âm (-) = trừ candy (spend)
  @Column()
  amount: number;

  // Snapshot số dư trước giao dịch — giúp audit/debug khi có sự cố
  @Column()
  balanceBefore: number;

  // Snapshot số dư sau giao dịch
  @Column()
  balanceAfter: number;

  // Loại bản ghi liên quan: 'payment_order' | 'chapter_purchase' | 'bonus'
  @Column({ nullable: true })
  referenceType: string;

  // ID của bản ghi liên quan (payment_orders.id hoặc chapter_purchases.id)
  @Column({ nullable: true })
  referenceId: string;

  // Mô tả ngắn gọn hiển thị cho user
  // VD: "Nạp 50,000đ = 500 candy", "Mở khoá Chương 5 - Tên truyện"
  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
