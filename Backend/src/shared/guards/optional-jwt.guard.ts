import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  // Không throw nếu không có token — req.user sẽ là undefined
  handleRequest<T>(_err: unknown, user: T): T {
    return user;
  }
}
