import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> { // T یعنی فرق نمیکند جنس دیتا از چی باشد  هرچی باشه داخل دیتا قرار میگیره
  success: boolean;
  message: string;
  data: T | null;
}

@Injectable() // کلاس قابل تزریق است
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext, // اطلاعات کامل درخواست ورودی (Request/Response)
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe( // کنترلر رو اجرا میکنه و به صورت استریم هم منتظر میمونه
      map((response) => {
        // اگر در سرویس مقداری مثل message برگردانده شده باشد، آن را جدا می‌کنیم
        let message = 'عملیات با موفقیت انجام شد';
        let data = response;

        if (
          response &&
          typeof response === 'object' &&
          'message' in response &&
          typeof response.message === 'string'
        ) {
          message = response.message;
          const { message: _, ...rest } = response; // میاد پیام رو از ابجکت برمیدارد تا تکراری نشود
          // اگر آبجکت فقط شامل پیام بود، دیتا نال می‌شود
          data = Object.keys(rest).length > 0 ? rest : null;
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}