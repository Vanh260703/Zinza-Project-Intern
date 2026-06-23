import {
  BeforeInsert,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums';
import { generateSlug } from 'src/common/utils/slug.util';
import { User } from 'src/users/entities/user.entity';

@Entity('stories')
@Check(`rating >= 0 AND rating <= 5`)
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'posted_by_id' })
  postedBy: User;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  poster: string;

  @Column()
  author: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: Status,
  })
  status: Status;

  @Column({ default: false })
  vip: boolean;

  @Column({ default: 0 })
  candyReceived: number; // Số kẹo nhận được từ tặng và mở khoá chương

  // Được cập nhật thủ công mỗi khi thêm/xoá chapter
  @Column({ default: 0 })
  chapterCount: number;

  @Column({ default: 0 })
  nominations: number; // Tổng số lượt đề cửp

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
  })
  rating: number;

  @Column({ default: 0 })
  ratingCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Chỉ generate slug khi INSERT, không regenerate khi UPDATE để tránh broken URL
  @BeforeInsert()
  generateSlug() {
    this.slug = generateSlug(this.name);
  }
}
