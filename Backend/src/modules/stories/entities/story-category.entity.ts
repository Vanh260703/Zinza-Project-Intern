import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Story } from './story.entity';
import { Category } from 'src/modules/categories/entities/category.entity';

@Entity('story_categories')
@Unique(['story', 'category']) // Ngăn duplicate: 1 truyện không được gán cùng 1 thể loại 2 lần
export class StoryCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;
}
