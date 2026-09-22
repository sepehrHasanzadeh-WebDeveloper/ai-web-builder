import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { SectionsService } from './sections.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';


@Controller('sections')
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
  ) {}
  // گرفتن همه سکشن‌های یک پروژه
  @Get('project/:projectId')
  findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetUser('id') userId: string,
  ) {
    return this.sectionsService.findAll(
      projectId,
      userId,
    );
  }
  // گرفتن یک سکشن خاص برای ادیتور
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.sectionsService.findOne(
      id,
      userId,
    );
  }
  // تغییر خروجی AI برای یک سکشن
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(
      id,
      userId,
      dto,
    );
  }
  // حذف سکشن
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.sectionsService.remove(
      id,
      userId,
    );
  }
}