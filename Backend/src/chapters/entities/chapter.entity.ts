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
import { Novel } from 'src/novels/entities/novel.entity';

@Entity('chapters')
@Unique(['novel', 'number']) // Chapter 1 của truyện A và truyện B không conflict
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Novel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'novel_id' })
  novel: Novel;

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
