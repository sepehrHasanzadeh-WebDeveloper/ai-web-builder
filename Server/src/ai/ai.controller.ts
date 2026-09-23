import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AiService } from './ai.service';
import { GenerateWebsiteDto } from './dto/generate-website.dto';
import {
  AddSectionWithAiDto,
  EditSectionWithAiDto,
} from './dto/section-ai.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('generate')
  generateWebsite(
    @GetUser('id') userId: string,
    @Body() dto: GenerateWebsiteDto,
  ) {
    return this.aiService.generateWebsite(
      dto.projectId,
      dto.prompt,
      userId,
    );
  }

  @Post('sections')
  addSection(
    @GetUser('id') userId: string,
    @Body() dto: AddSectionWithAiDto,
  ) {
    return this.aiService.addSection(dto.projectId, dto.prompt, userId);
  }

  @Patch('sections/:sectionId')
  editSection(
    @GetUser('id') userId: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() dto: EditSectionWithAiDto,
  ) {
    return this.aiService.editSection(sectionId, dto.prompt, userId);
  }
}
