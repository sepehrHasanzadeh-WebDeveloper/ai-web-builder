import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'رفرش توکن الزامی است' })
  @IsString()
  refreshToken: string;
}