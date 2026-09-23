import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddSectionWithAiDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;
}

export class EditSectionWithAiDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
