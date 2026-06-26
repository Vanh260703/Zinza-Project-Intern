import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/modules/users/users.module';
import { TokenModule } from 'src/shared/token';
import { MailModule } from 'src/shared/mail/mail.module';

@Module({
  imports: [
    PassportModule,
    UsersModule, // AuthService + JwtStrategy dùng UsersService
    TokenModule, // AuthService dùng TokenService
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
