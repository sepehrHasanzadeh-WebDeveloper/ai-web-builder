import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @IsString({ message: 'شماره موبایل باید رشته متنی باشد' })
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل  معتبر نیست)',
  })
  phone: string;
}