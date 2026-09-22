import {
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message, MessageRole } from './entities/message.entity';


@Injectable()
export class MessagesService {

  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}


  // ساخت پیام جدید (توسط AI یا User)
  async create(data: {
    projectId?: string;
    sectionId?: string;
    role: MessageRole;
    content: string;
  }): Promise<Message> {

    const message = this.messageRepo.create({
      projectId: data.projectId ?? null,
      sectionId: data.sectionId ?? null,
      role: data.role,
      content: data.content,
    });

    return this.messageRepo.save(message);
  }



  // تاریخچه چت اصلی پروژه
  async findProjectMessages(
    projectId: string,
    userId: string,
  ): Promise<Message[]> {

    return this.messageRepo.find({
      where: {
        projectId,
        project: {
          userId,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }



  // تاریخچه چت یک سکشن
  async findSectionMessages(
    sectionId: string,
    userId: string,
  ): Promise<Message[]> {

    return this.messageRepo.find({
      where: {
        sectionId,
        section: {
          project: {
            userId,
          },
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }
}