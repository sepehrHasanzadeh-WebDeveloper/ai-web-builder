import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { CustomBaseEntity } from '../../common/entities/base.entity';
import { Section } from '../../sections/entities/section.entity';
import { Project } from '../../projects/entities/project.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message extends CustomBaseEntity {

  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.USER,
  })
  role: MessageRole;


  // متن پرامپت کاربر یا خروجی AI
  @Column({ type: 'text' })
  content: string;


  // پیام اصلی ساخت پروژه
  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;


  @ManyToOne(() => Project, (project) => project.messages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'projectId' })
  project: Project | null;


  // پیام مربوط به ویرایش یک سکشن خاص
  @Column({ type: 'uuid', nullable: true })
  sectionId: string | null;


  @ManyToOne(() => Section, (section) => section.messages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'sectionId' })
  section: Section | null;
}