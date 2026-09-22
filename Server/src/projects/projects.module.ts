import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport'
@Module({
  imports: [TypeOrmModule.forFeature([Project]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
],
  controllers: [ProjectsController],
  providers: [ProjectsService] ,
  exports:[ProjectsService]
})
export class ProjectsModule {}
