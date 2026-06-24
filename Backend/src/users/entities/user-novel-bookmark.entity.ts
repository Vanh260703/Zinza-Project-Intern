import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Novel } from 'src/novels/entities/novel.entity';

@Entity('user_novel_bookmarks')
@Unique(['user', 'novel']) // Ngăn user bookmark cùng 1 truyện nhiều lần
export class UserNovelBookMark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Novel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'novel_id' })
  novel: Novel;

  @CreateDateColumn()
  createdAt: Date;
}
