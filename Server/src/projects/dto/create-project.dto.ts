import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'نام پروژه الزامی است' })
  @MaxLength(100, { message: 'نام پروژه نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}