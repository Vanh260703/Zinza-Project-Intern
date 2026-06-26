import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';

@Entity('user_novel_reads')
@Unique(['user', 'novel']) // Mỗi user chỉ có 1 record per novel (track chapter đọc gần nhất)
export class UserNovelRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Novel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'novel_id' })
  novel: Novel;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @UpdateDateColumn()
  lastReadAt: Date;
}
