// JWT 鉴权守卫：从 Authorization: Bearer <token> 中解析用户
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/** 挂在请求上的用户信息 */
export interface AuthUser {
  userId: number;
  nickname: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('请先登录');
    }
    const token = authHeader.slice(7);
    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token);
      (request as Request & { user: AuthUser }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
  }
}
