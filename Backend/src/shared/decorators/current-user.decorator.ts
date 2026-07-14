import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/users/entities/user.entity';

// Custom parameter decorator — lấy user đã được JwtStrategy gắn vào req.user
// Thay vì viết @Req() req rồi dùng req.user, dùng @CurrentUser() trực tiếp
//
// Ví dụ dùng:
//   @Get('me')
//   getMe(@CurrentUser() user: User) { return user; }
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
