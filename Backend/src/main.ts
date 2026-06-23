import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { HttpExceptionFilter } from './common/filters';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // bắt buộc để browser gửi cookie kèm request
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Global exception filter: format nhất quán cho mọi lỗi HTTP
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe: tự động validate DTO trên toàn app
  // whitelist: true          → bỏ field lạ không có trong DTO
  // forbidNonWhitelisted: true → trả lỗi nếu client gửi thêm field lạ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Prefix chung cho tất cả route: /api/v1/...
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api/v1`);

  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    console.log('✅ Kết nối database thành công');
  }
}

bootstrap();
