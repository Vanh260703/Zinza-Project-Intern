import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole, UserGender } from '../enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserGender,
  })
  gender: UserGender;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 0 })
  chaptersRead: number; // Tổng chapters đã đọc

  @Column({ default: 0 })
  recommendationTicket: number; // Vé đề cử

  @Column({ default: 0 })
  dailyReadCount: number; // reset mỗi ngày

  @Column({ nullable: true })
  dailyReadDate: Date; // Ngày của dailyReadCount

  // Field xem đã nhận vé đề cử của ngày hôm nay chưa
  @Column({ default: false })
  dailyTicketClaimed: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
