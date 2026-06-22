import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

interface JwtPayload {
  sub: Omit<User, 'password'>;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET_KEY', ''),
    });
  }

  // Passport tự verify chữ ký + hết hạn trước khi gọi validate()
  // payload ở đây đã được xác thực hợp lệ
  async validate(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findById(payload.sub.id);
    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }
    // Giá trị trả về sẽ được gán vào req.user
    return user;
  }
}
