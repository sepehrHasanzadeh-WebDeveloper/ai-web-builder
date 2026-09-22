import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class GenerateWebsiteDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;
}