import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/shared/guards';
import { CurrentUser } from 'src/shared/decorators';
import { User } from 'src/modules/users/entities/user.entity';

@Controller('user/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // [GET] /api/v1/user/notifications?page=1&limit=20
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.notificationsService.findAll(user.id, page, limit);
  }

  // [PATCH] /api/v1/user/notifications/read-all — đánh dấu tất cả đã đọc
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user.id);
  }

  // [GET] /api/v1/user/notifications/:id — lấy chi tiết + tự động đánh dấu đã đọc
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.findOne(user.id, id);
  }
}
