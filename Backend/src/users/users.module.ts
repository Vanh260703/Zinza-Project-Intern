import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './users.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { UserWallet } from 'src/payments/entities/user-wallet.entity';
import { UserNovelBookMark } from './entities/user-novel-bookmark.entity';
import { UserNovelRead } from './entities/user-novel-read.entity';
import { Novel } from 'src/novels/entities/novel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserWallet,
      UserNovelBookMark,
      UserNovelRead,
      Novel,
    ]),
    CloudinaryModule,
    PaymentsModule,
  ],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
