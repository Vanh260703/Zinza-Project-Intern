import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Novel } from './novel.entity';
import { Category } from 'src/modules/categories/entities/category.entity';

@Entity('novel_categories')
@Unique(['novel', 'category']) // Ngăn duplicate: 1 truyện không được gán cùng 1 thể loại 2 lần
export class NovelCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Novel, (novel) => novel.novelCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'novel_id' })
  novel: Novel;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;
}
