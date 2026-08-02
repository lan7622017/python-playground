// 应用根模块：数据库连接 + 各业务模块注册
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DB_PATH } from './common/config';
import { User } from './entities/user.entity';
import { Level } from './entities/level.entity';
import { LevelProgress } from './entities/progress.entity';
import { Checkin } from './entities/checkin.entity';
import { UserBadge } from './entities/user-badge.entity';
import { AuthModule } from './modules/auth/auth.module';
import { LevelsModule } from './modules/levels/levels.module';
import { ProgressModule } from './modules/progress/progress.module';
import { CheckinsModule } from './modules/checkins/checkins.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    // SQLite 数据库（synchronize 自动建表；变更表结构时先删 db 文件再重启）
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(process.cwd(), DB_PATH),
      entities: [User, Level, LevelProgress, Checkin, UserBadge],
      synchronize: true,
    }),
    AuthModule,
    LevelsModule,
    ProgressModule,
    CheckinsModule,
    ProfileModule,
  ],
})
export class AppModule {}
