import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './enums/notification-type.enum';

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Dùng để gửi thông báo cho 1 user
  async create(input: CreateNotificationInput): Promise<Notification> {
    return this.notificationRepository.save(
      this.notificationRepository.create({
        user: { id: input.userId },
        type: input.type,
        title: input.title,
        content: input.content,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        metadata: input.metadata,
      }),
    );
  }

  // Bulk insert — dùng để gửi thông báo cho nhiều user cùng lúc
  async createMany(inputs: CreateNotificationInput[]): Promise<void> {
    if (inputs.length === 0) return;
    await this.notificationRepository.insert(
      inputs.map((input) =>
        this.notificationRepository.create({
          user: { id: input.userId },
          type: input.type,
          title: input.title,
          content: input.content,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          metadata: input.metadata,
        }),
      ),
    );
  }

  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) throw new NotFoundException('Thông báo không tồn tại');

    if (!notification.isRead) {
      await this.notificationRepository.update(id, {
        isRead: true,
        readAt: new Date(),
      });
      notification.isRead = true;
      notification.readAt = new Date();
    }

    return notification;
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { updated: result.affected ?? 0 };
  }
}
