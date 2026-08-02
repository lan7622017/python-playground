// 关卡模块
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from '../../entities/level.entity';
import { LevelProgress } from '../../entities/progress.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level, LevelProgress, User]), AuthModule],
  controllers: [LevelsController],
  providers: [LevelsService],
  exports: [LevelsService],
})
export class LevelsModule {}
