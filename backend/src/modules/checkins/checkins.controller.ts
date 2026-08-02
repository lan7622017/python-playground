// 打卡接口控制器
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { CheckinResult } from 'python-playground-shared';
import { AuthUser, JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CheckinsService } from './checkins.service';

/** 带用户信息的请求 */
interface AuthedRequest {
  user: AuthUser;
}

@UseGuards(JwtAuthGuard)
@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  /** 每日打卡 */
  @Post()
  checkin(@Req() req: AuthedRequest): Promise<CheckinResult> {
    return this.checkinsService.checkin(req.user.userId);
  }
}
