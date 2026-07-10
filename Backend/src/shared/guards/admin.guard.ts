import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from 'src/modules/users/enums/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có quyền truy cập');
    }
    return true;
  }
}
