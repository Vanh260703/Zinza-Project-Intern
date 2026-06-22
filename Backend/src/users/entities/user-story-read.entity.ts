import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Story } from 'src/stories/entities/story.entity';
import { Chapter } from 'src/chapters/entities/chapter.entity';

@Entity('user_story_reads')
@Unique(['user', 'story']) // Mỗi user chỉ có 1 record per story (track chapter đọc gần nhất)
export class UserStoryRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @UpdateDateColumn()
  lastReadAt: Date;
}
