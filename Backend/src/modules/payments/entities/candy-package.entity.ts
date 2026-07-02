import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('candy_packages')
export class CandyPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  price: number;

  // Số candy cơ bản nhận được
  @Column()
  candy: number;

  // Candy thưởng thêm khi chạy event / khuyến mãi (default: 0)
  // VD: nạp 50k tặng thêm 50 candy → bonusCandy = 50
  @Column({ default: 0 })
  bonus: number;

  // VD: "Phổ biến", "Giá trị nhất"
  @Column({ nullable: true })
  badge: string;

  // Admin bật/tắt gói mà không cần xóa
  @Column({ default: true })
  isActive: boolean;

  // Thứ tự hiển thị trên UI (số nhỏ hiển thị trước)
  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
