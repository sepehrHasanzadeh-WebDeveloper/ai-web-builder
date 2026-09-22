import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AiService } from './ai.service';
import { GenerateWebsiteDto } from './dto/generate-website.dto';


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
}