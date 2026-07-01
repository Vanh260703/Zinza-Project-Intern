import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Người nhận thông báo
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  // Loại entity liên quan để client điều hướng khi click vào thông báo
  // VD: 'chapter' → /stories/:storyId/chapters/:chapterId
  //     'comment' → /stories/:storyId#comment-:commentId
  //     'payment_order' → /wallet
  //     null → không điều hướng (thông báo hệ thống)
  @Column({ nullable: true })
  referenceType: string;

  // ID của entity liên quan
  @Column({ nullable: true })
  referenceId: string;

  // Data bổ sung tuỳ loại thông báo, tránh phải join nhiều bảng khi render
  // NEW_CHAPTER:      { storyId, storyName, chapterNumber, chapterTitle, storyPoster }
  // NEW_COMMENT:      { commentId, commenterName, commenterAvatar, storyId, storyName }
  // COMMENT_REPLY:    { commentId, parentCommentId, replierName, replierAvatar, storyId }
  // PAYMENT_SUCCESS:  { orderId, amountVnd, candyAmount }
  // SYSTEM:           {} (title + body là đủ)
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
