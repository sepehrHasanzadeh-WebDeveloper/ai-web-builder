import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل باید یک شماره معتبر ایرانی باشد',
  })
  phone: string;
}