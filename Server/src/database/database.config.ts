import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs( // برای ماژولار کردن در نست استفاده میشه تابع خود نست در تنظیمات پروژه کاربرد داره
  'database', // اسم فضای نامی NameSpace
  (): TypeOrmModuleOptions => ({ //تابعی که یک آبجکت کانفیگ با تایپ مشخص تولید می‌کن
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: 5438,
    username: process.env.DB_USERNAME || 'postgres-ai',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'ai_web_builder_db',
    autoLoadEntities: true,
    synchronize: true, // برای محیط توسعه مناسب است؛ اسکیما خودکار ساخته می‌شود
  }),
);