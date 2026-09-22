import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SectionsModule } from '../sections/sections.module';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports :[ SectionsModule, MessagesModule , AuthModule , ProjectsModule],
  controllers: [AiController],
  providers: [AiService],
  exports:[AiService]
})
export class AiModule {}
