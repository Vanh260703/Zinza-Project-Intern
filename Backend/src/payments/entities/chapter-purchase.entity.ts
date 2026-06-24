import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Chapter } from 'src/chapters/entities/chapter.entity';
import { Novel } from 'src/novels/entities/novel.entity';

@Entity('chapter_purchases')
@Unique(['user', 'chapter']) // Mỗi user chỉ mua 1 chapter 1 lần
export class ChapterPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  // Denormalized để query "tất cả chapter đã mua của truyện X" không cần join Chapter
  @ManyToOne(() => Novel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'novel_id' })
  novel: Novel;

  // Snapshot số candy đã trả tại thời điểm mua (giá có thể thay đổi sau này)
  @Column()
  candySpent: number;

  @CreateDateColumn()
  createdAt: Date;
}
