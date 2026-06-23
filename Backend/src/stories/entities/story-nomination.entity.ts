import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Story } from './story.entity';

// Mỗi user chỉ được đề cử 1 lần / 1 truyện
// Số đề cử thực tế = COUNT(*) từ bảng này
@Entity('story_nominations')
@Unique(['user', 'story'])
export class StoryNomination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
