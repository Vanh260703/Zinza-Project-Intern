import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
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
import { PaymentsService } from 'src/payments/payments.service';
import { JwtAuthGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // [GET] /api/v1/users/me
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  // [PATCH] /api/v1/users/profile
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // [PATCH] /api/v1/users/change-password
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

  // [POST] /api/v1/users/me/upload-avatar
  @UseGuards(JwtAuthGuard)
  @Post('/me/upload-avatar')
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

  // [GET] /api/v1/users/me/wallet
  @UseGuards(JwtAuthGuard)
  @Get('/me/wallet')
  getWallet(@CurrentUser() user: User) {
    return this.paymentsService.getWallet(user.id);
  }
}
