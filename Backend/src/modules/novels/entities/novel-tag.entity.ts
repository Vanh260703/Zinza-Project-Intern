import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Novel } from './novel.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';

@Entity('novel_tags')
@Unique(['novel', 'tag']) // Ngăn duplicate: 1 truyện không được gán cùng 1 tag 2 lần
export class NovelTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Novel, (novel) => novel.novelTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'novel_id' })
  novel: Novel;

  @ManyToOne(() => Tag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;
}
