import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Novel]), NotificationsModule],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
