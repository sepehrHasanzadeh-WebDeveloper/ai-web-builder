import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // => اگر پرانتز خالی باشد به این منطوره که هر چی ارور هر چی از هر نوعی داشت رو تو بگیر
export class AllExceptionsFilter implements ExceptionFilter { // تضمین میکنه من با این قانون استاندارد داده ها رو برمیگردانم
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // در بستر وب  پروتوکل هستیم
    const response = ctx.getResponse<Response>(); // پاسخ کل رو بده

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'خطای داخلی سرور رخ داده است';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        // خطاهای چندگانه class-validator به صورت آرایه در message می‌آیند
        if (Array.isArray(resObj.message)) { // یعنی اگر خطا در قالب ارایه بود اولین خونه یا اولین خطا رو نشون بده
          message = resObj.message[0];
        } else if (resObj.message) {
          message = String(resObj.message);
        }
      }
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
    });
  }
}