import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  htmlCode?: string;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}