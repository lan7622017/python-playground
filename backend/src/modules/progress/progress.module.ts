// 进度模块
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from '../../entities/level.entity';
import { LevelProgress } from '../../entities/progress.entity';
import { User } from '../../entities/user.entity';
import { UserBadge } from '../../entities/user-badge.entity';
import { AuthModule } from '../auth/auth.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Level, LevelProgress, User, UserBadge]),
    AuthModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
