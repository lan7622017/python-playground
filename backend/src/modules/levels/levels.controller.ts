// 关卡接口控制器
import { Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { LevelListItem, ViewAnswerResponse } from 'python-playground-shared';
import { JwtAuthGuard, AuthUser } from '../../common/jwt-auth.guard';
import { LevelsService } from './levels.service';

/** 带用户信息的请求 */
interface AuthedRequest {
  user: AuthUser;
}

@UseGuards(JwtAuthGuard)
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  /** 关卡列表（含解锁状态） */
  @Get()
  list(@Req() req: AuthedRequest): Promise<LevelListItem[]> {
    return this.levelsService.listLevels(req.user.userId);
  }

  /** 关卡详情 */
  @Get(':id')
  detail(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LevelListItem> {
    return this.levelsService.getLevel(req.user.userId, id);
  }

  /** 查看标准答案（通关免费；未通关扣积分） */
  @Post(':id/answer')
  answer(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ViewAnswerResponse> {
    return this.levelsService.viewAnswer(req.user.userId, id);
  }
}
