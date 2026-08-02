// 认证接口控制器
import { Body, Controller, Post } from '@nestjs/common';
import type { AuthResponse, LoginRequest, RegisterRequest } from 'python-playground-shared';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 注册 */
  @Post('register')
  register(@Body() body: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(body);
  }

  /** 登录 */
  @Post('login')
  login(@Body() body: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(body);
  }
}
