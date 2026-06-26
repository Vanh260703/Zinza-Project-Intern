import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Story } from './story.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';

@Entity('story_tags')
@Unique(['story', 'tag']) // Ngăn duplicate: 1 truyện không được gán cùng 1 tag 2 lần
export class StoryTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @ManyToOne(() => Tag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;
}
