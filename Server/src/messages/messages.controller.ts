import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}
  // تاریخچه چت اصلی پروژه
  @Get('project/:projectId')
  findProjectMessages(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetUser('id') userId: string,
  ) {
    return this.messagesService.findProjectMessages(
      projectId,
      userId,
    );
  }
  // تاریخچه چت یک سکشن
  @Get('section/:sectionId')
  findSectionMessages(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @GetUser('id') userId: string,
  ) {
    return this.messagesService.findSectionMessages(
      sectionId,
      userId,
    );
  }
}