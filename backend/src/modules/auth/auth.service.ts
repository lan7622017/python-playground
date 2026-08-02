// 认证模块：注册、登录、JWT 签发
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthResponse, LoginRequest, RegisterRequest, UserPublic } from 'python-playground-shared';
import { User } from '../../entities/user.entity';
import { hashPassword, verifyPassword } from '../../common/crypto.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /** 注册新用户 */
  async register(body: RegisterRequest): Promise<AuthResponse> {
    const nickname = body.nickname?.trim();
    const password = body.password ?? '';
    // 基础校验
    if (!nickname || nickname.length < 2 || nickname.length > 20) {
      throw new BadRequestException('昵称需要 2-20 个字符');
    }
    if (password.length < 6) {
      throw new BadRequestException('密码至少 6 位');
    }
    const exists = await this.userRepo.findOne({ where: { nickname } });
    if (exists) {
      throw new BadRequestException('该昵称已被使用');
    }
    const user = this.userRepo.create({
      nickname,
      passwordHash: await hashPassword(password),
    });
    await this.userRepo.save(user);
    return this.buildAuthResponse(user);
  }

  /** 登录 */
  async login(body: LoginRequest): Promise<AuthResponse> {
    const nickname = body.nickname?.trim() ?? '';
    const user = await this.userRepo.findOne({ where: { nickname } });
    if (!user || !(await verifyPassword(body.password ?? '', user.passwordHash))) {
      throw new UnauthorizedException('昵称或密码不正确');
    }
    return this.buildAuthResponse(user);
  }

  /** 生成 JWT 并组装响应 */
  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const token = await this.jwtService.signAsync({
      userId: user.id,
      nickname: user.nickname,
    });
    const publicUser: UserPublic = {
      id: user.id,
      nickname: user.nickname,
      totalPoints: user.totalPoints,
      currentLevelOrder: user.currentLevelOrder,
      streakDays: 0, // 连续打卡天数由打卡模块动态计算，这里用 0 占位
    };
    return { token, user: publicUser };
  }
}
