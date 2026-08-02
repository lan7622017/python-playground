// 通关提交接口控制器
import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { SubmitLevelRequest, SubmitLevelResponse } from 'python-playground-shared';
import { AuthUser, JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ProgressService } from './progress.service';

/** 带用户信息的请求 */
interface AuthedRequest {
  user: AuthUser;
}

@UseGuards(JwtAuthGuard)
@Controller('levels')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /** 提交关卡结果（通关/失败） */
  @Post(':id/submit')
  submit(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SubmitLevelRequest,
  ): Promise<SubmitLevelResponse> {
    return this.progressService.submitLevel(req.user.userId, id, body);
  }
}
