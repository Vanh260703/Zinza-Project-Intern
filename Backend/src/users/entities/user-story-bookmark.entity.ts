import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Story } from 'src/stories/entities/story.entity';

@Entity('user_story_bookmarks')
@Unique(['user', 'story']) // Ngăn user bookmark cùng 1 truyện nhiều lần
export class UserStoryBookMark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @CreateDateColumn()
  createdAt: Date;
}
