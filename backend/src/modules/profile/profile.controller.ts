// 个人中心接口控制器
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { ProfileData } from 'python-playground-shared';
import { AuthUser, JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ProfileService } from './profile.service';

/** 带用户信息的请求 */
interface AuthedRequest {
  user: AuthUser;
}

@UseGuards(JwtAuthGuard)
@Controller('me')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /** 我的个人信息（积分/徽章/进度/打卡） */
  @Get()
  getProfile(@Req() req: AuthedRequest): Promise<ProfileData> {
    return this.profileService.getProfile(req.user.userId);
  }
}
