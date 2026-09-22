import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';
import { Message } from '../../messages/entities/message.entity';
 

@Entity('sections')
export class Section extends CustomBaseEntity {
  // عنوان یا نام نمایشی سکشن در ادیتور (مثل: "بخش هدر", "معرفی محصول")
  @Column({ type: 'varchar', length: 100 })
  name: string;

  // کلید شناسه ثابت سکشن برای فرانت‌اند (مثل: 'navbar', 'hero', 'features', 'footer')
  @Column({ type: 'varchar', length: 50 })
  key: string;

  // ترتیب قرارگیری سکشن در صفحه (از بالا به پایین)
  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  // کد کامل HTML + Tailwind که توسط هوش مصنوعی تولید/ویرایش می‌شود
  // نمونه: <section class="bg-slate-900 text-white py-16 ...">...</section>
  @Column({ type: 'text', nullable: true })
  htmlCode?: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  // پیام‌های رد و بدل شده (چت) مختص این سکشن
  @OneToMany(() => Message, (message) => message.section, { cascade: true })
  messages: Message[];

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}