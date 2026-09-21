import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @IsString({ message: 'شماره موبایل باید رشته متنی باشد' })
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل باید یک شماره معتبر ایرانی باشد (مثال: 09123456789)',
  })
  phone: string;

  @IsNotEmpty({ message: 'کد تایید الزامی است' })
  @IsString({ message: 'کد تایید باید رشته متنی باشد' })
 @Length(4, 4, { message: 'کد تایید باید دقیقاً ۴ رقم باشد' }) // min , max => 4 , 4
  code: string;
}