import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Story } from 'src/stories/entities/story.entity';

@Entity('chapters')
@Unique(['story', 'number']) // Chapter 1 của truyện A và truyện B không conflict
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column()
  number: number;

  @Column()
  title: string;

  // Dùng type: 'text' để lưu nội dung chương dài
  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  wordCount: number;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
