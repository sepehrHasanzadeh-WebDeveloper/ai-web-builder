import { Module } from '@nestjs/common';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { Section } from './entities/section.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Section]) ,
  AuthModule
],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports:[SectionsService]
})
export class SectionsModule {}
