import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { AiModule } from './ai/ai.module';
import { SectionsModule } from './sections/sections.module';
import { ProjectsModule } from './projects/projects.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database/database.config';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [AuthModule, UsersModule, MessagesModule, AiModule, SectionsModule, ProjectsModule , ConfigModule.forRoot({
    isGlobal : true,
    load : [databaseConfig]
  }),
  DatabaseModule
]
})
export class AppModule {}
