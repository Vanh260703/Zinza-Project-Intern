import {
  BeforeInsert,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums';
import { generateSlug } from 'src/shared/utils/slug.util';
import { User } from 'src/modules/users/entities/user.entity';
import { NovelCategory } from './novel-category.entity';
import { NovelTag } from './novel-tag.entity';

@Entity('novels')
@Check(`rating >= 0 AND rating <= 5`)
export class Novel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'posted_by_id' })
  postedBy: User;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  poster: string;

  @Column()
  author: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
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

  @Index()
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

  @Column({ default: 0 })
  views: number;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NovelCategory, (nc) => nc.novel)
  novelCategories: NovelCategory[];

  @OneToMany(() => NovelTag, (nt) => nt.novel)
  novelTags: NovelTag[];

  // Chỉ generate slug khi INSERT, không regenerate khi UPDATE để tránh broken URL
  @BeforeInsert()
  generateSlug() {
    if (!this.slug) this.slug = generateSlug(this.name);
  }
}
