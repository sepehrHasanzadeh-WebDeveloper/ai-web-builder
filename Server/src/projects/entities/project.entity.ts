import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

import { CustomBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Section } from '../../sections/entities/section.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('projects')
export class Project extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // سکشن‌های پروژه
  @OneToMany(() => Section, (section) => section.project, {
    cascade: true,
  })
  sections: Section[];

  // پیام‌های چت اصلی پروژه
  @OneToMany(() => Message, (message) => message.project, {
    cascade: true,
  })
  messages: Message[];

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}