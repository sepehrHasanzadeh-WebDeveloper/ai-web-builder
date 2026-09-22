import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]) , AuthModule],
  controllers: [MessagesController],
  providers: [MessagesService] ,
  exports:[MessagesService]
})
export class MessagesModule {}
