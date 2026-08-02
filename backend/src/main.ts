// 后端服务入口
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 允许前端跨域访问
  app.enableCors();
  // 统一接口前缀：/api
  app.setGlobalPrefix('api');
  await app.listen(PORT);
  console.log(`后端服务已启动: http://localhost:${PORT}/api`);
}
void bootstrap();
