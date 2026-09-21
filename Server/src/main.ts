import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors(
    {origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,}
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // حذف فیلدهای اضافه‌ای که در DTO تعریف نشده‌اند
      forbidNonWhitelisted: true, // خطا در صورت ارسال فیلدهای ناشناس
      transform: true, // تبدیل تایپ‌های ورودی به تایپ‌های مشخص‌شده در DTO
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
