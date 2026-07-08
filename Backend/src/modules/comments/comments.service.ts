import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { CommentTargetType } from './enums/comment-target-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findByTarget(
    targetType: CommentTargetType,
    targetId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { targetType, targetId },
      relations: { user: true },
      select: { user: { id: true, name: true, avatarUrl: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: comments.map((c) => this.toResponse(c)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createForTarget(
    userId: string,
    targetType: CommentTargetType,
    targetId: string,
    dto: CreateCommentDto,
  ) {
    const comment = await this.commentRepository.save(
      this.commentRepository.create({
        user: { id: userId },
        targetType,
        targetId,
        content: dto.content,
      }),
    );

    // Cập nhật counter cached — chỉ khi comment gắn vào truyện
    if (targetType === CommentTargetType.NOVEL) {
      await this.commentRepository.manager.increment(
        Novel,
        { id: targetId },
        'commentCount',
        1,
      );
    }

    const saved = await this.commentRepository.findOne({
      where: { id: comment.id },
      relations: { user: true },
      select: { user: { id: true, name: true, avatarUrl: true } },
    });

    return this.toResponse(saved!);
  }

  async update(userId: string, id: string, dto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!comment)
      throw new NotFoundException(
        'Bình luận không tồn tại hoặc bạn không có quyền chỉnh sửa',
      );

    await this.commentRepository.update(id, { content: dto.content });
    return { message: 'Cập nhật bình luận thành công' };
  }

  async remove(userId: string, id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!comment)
      throw new NotFoundException(
        'Bình luận không tồn tại hoặc bạn không có quyền xoá',
      );

    await this.commentRepository.delete(id);

    // Giảm counter cached tương ứng — chỉ khi comment gắn vào truyện
    if (comment.targetType === CommentTargetType.NOVEL) {
      await this.commentRepository.manager.decrement(
        Novel,
        { id: comment.targetId },
        'commentCount',
        1,
      );
    }

    return { message: 'Xoá bình luận thành công' };
  }

  private toResponse(comment: Comment) {
    return {
      id: comment.id,
      content: comment.content,
      targetType: comment.targetType,
      targetId: comment.targetId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatarUrl: comment.user.avatarUrl ?? null,
      },
    };
  }
}
