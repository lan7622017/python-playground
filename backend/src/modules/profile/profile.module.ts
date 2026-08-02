// 个人中心模块
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserBadge } from '../../entities/user-badge.entity';
import { LevelProgress } from '../../entities/progress.entity';
import { AuthModule } from '../auth/auth.module';
import { CheckinsModule } from '../checkins/checkins.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserBadge, LevelProgress]),
    AuthModule,
    CheckinsModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
