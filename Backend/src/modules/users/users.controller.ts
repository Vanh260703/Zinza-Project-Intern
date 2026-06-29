import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TrackDailyReadDto } from './dto/track-daily-read.dto';
import { PaymentsService } from 'src/modules/payments/payments.service';
import { JwtAuthGuard } from 'src/shared/guards';
import { CurrentUser } from 'src/shared/decorators';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // [GET] /api/v1/user
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  // [PATCH] /api/v1/user/profile
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // [PATCH] /api/v1/user/change-password
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, dto);
    return { message: 'Đổi mật khẩu thành công' };
  }

  // [POST] /api/v1/user/upload-avatar
  @UseGuards(JwtAuthGuard)
  @Post('/upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(user.id, file);
  }

  // [GET] /api/v1/user/wallet
  @UseGuards(JwtAuthGuard)
  @Get('/wallet')
  getWallet(@CurrentUser() user: User) {
    return this.paymentsService.getWallet(user.id);
  }

  // [GET] /api/v1/user/bookmarks
  @UseGuards(JwtAuthGuard)
  @Get('/bookmarks')
  getBookmarks(@CurrentUser() user: User) {
    return this.usersService.getBookmarks(user.id);
  }

  // [POST] /api/v1/user/bookmarks/:storyId — toggle (thêm nếu chưa có, xoá nếu đã có)
  @UseGuards(JwtAuthGuard)
  @Post('/bookmarks/:storyId')
  @HttpCode(HttpStatus.OK)
  toggleBookmark(
    @CurrentUser() user: User,
    @Param('storyId', ParseUUIDPipe) storyId: string,
  ) {
    return this.usersService.toggleBookmark(user.id, storyId);
  }

  // [POST] /api/v1/user/daily-read — track chapter đã đọc trong ngày
  @UseGuards(JwtAuthGuard)
  @Post('daily-read')
  @HttpCode(HttpStatus.OK)
  async trackDailyRead(
    @CurrentUser() user: User,
    @Body() dto: TrackDailyReadDto,
  ) {
    await this.usersService.trackDailyRead(user.id, dto);
    return { message: 'OK' };
  }

  // [DELETE] /api/v1/user/read-history — xoá toàn bộ lịch sử
  @UseGuards(JwtAuthGuard)
  @Delete('/read-history')
  @HttpCode(HttpStatus.OK)
  async clearAllReadHistory(@CurrentUser() user: User) {
    await this.usersService.clearAllReadHistory(user.id);
    return { message: 'Xoá toàn bộ lịch sử đọc thành công' };
  }

  // [DELETE] /api/v1/user/read-history/:id — xoá 1 bản ghi
  @UseGuards(JwtAuthGuard)
  @Delete('/read-history/:id')
  @HttpCode(HttpStatus.OK)
  async deleteReadHistory(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.usersService.deleteReadHistory(user.id, id);
    return { message: 'Xoá lịch sử đọc thành công' };
  }
}
