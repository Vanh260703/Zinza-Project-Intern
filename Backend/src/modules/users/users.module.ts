import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController, PublicUserController } from './users.controller';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { NovelsModule } from 'src/modules/novels/novels.module';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { UserNovelBookMark } from './entities/user-novel-bookmark.entity';
import { UserNovelRead } from './entities/user-novel-read.entity';
import { UserDailyRead } from './entities/user-daily-read.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserWallet,
      UserNovelBookMark,
      UserNovelRead,
      UserDailyRead,
      Novel,
    ]),
    CloudinaryModule,
    PaymentsModule,
    NovelsModule,
  ],
  controllers: [UserController, PublicUserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
