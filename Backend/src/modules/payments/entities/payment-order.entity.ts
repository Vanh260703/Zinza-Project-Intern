import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { CandyPackage } from './candy-package.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity('payment_orders')
export class PaymentOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Gói candy user chọn — null nếu nhập tay số tiền tùy ý
  @ManyToOne(() => CandyPackage, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'candy_package_id' })
  candyPackage: CandyPackage;

  // Mã đơn hàng duy nhất — user ghi vào nội dung chuyển khoản để SePay match
  // VD: "NOVEL240527A1B2C3"
  @Column({ unique: true })
  orderCode: string;

  // Số tiền VND user cần chuyển (snapshot từ candy_package tại thời điểm tạo đơn)
  @Column()
  amountVnd: number;

  // Tổng candy nhận được = candyAmount + bonusCandy (snapshot tại thời điểm tạo đơn)
  @Column()
  candyAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // ID giao dịch do SePay trả về qua webhook (null khi chưa thanh toán)
  @Column({ nullable: true })
  sepayTransactionId: string;

  // Thời điểm thanh toán thành công
  @Column({ nullable: true })
  paidAt: Date;

  // Hết hạn đơn — sau thời gian này không chấp nhận thanh toán nữa
  @Column()
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
