import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('user_wallets')
export class UserWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Số dư candy hiện tại — source of truth (KHÔNG dùng candy trong User nữa)
  @Column({ default: 0 })
  balance: number;

  // Tổng candy đã nạp từ trước đến nay (thống kê)
  @Column({ default: 0 })
  totalDeposited: number;

  // Tổng candy đã tiêu từ trước đến nay (thống kê)
  @Column({ default: 0 })
  totalSpent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
