import { Controller, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/v1/users/me
  // @UseGuards(JwtAuthGuard) => route này yêu cầu JWT token hợp lệ
  // Nếu không có token hoặc token sai => trả 401 Unauthorized
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }
}
