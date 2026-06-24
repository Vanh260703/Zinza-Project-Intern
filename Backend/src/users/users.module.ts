import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './users.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { UserWallet } from 'src/payments/entities/user-wallet.entity';
import { UserStoryBookMark } from './entities/user-story-bookmark.entity';
import { UserStoryRead } from './entities/user-story-read.entity';
import { Story } from 'src/stories/entities/story.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserWallet,
      UserStoryBookMark,
      UserStoryRead,
      Story,
    ]),
    CloudinaryModule,
    PaymentsModule,
  ],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
