import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { UpdateSectionDto } from './dto/update-section.dto';
@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
  ) {}

  // ساخت یا به‌روزرسانی سکشن توسط AI
  async createFromAI(data: {
  projectId: string;
  name: string;
  key: string;
  htmlCode: string;
  orderIndex: number;
}): Promise<Section> {
  const existingSection = await this.sectionRepo.findOne({
    where: {
      projectId: data.projectId,
      key: data.key,
    },
  });

  if (existingSection) {
    existingSection.name = data.name;
    existingSection.htmlCode = data.htmlCode;
    existingSection.orderIndex = data.orderIndex;

    return this.sectionRepo.save(existingSection);
  }

  const section = this.sectionRepo.create({
    projectId: data.projectId,
    name: data.name,
    key: data.key,
    htmlCode: data.htmlCode,
    orderIndex: data.orderIndex,
  });

  return this.sectionRepo.save(section);
}
  // دریافت تمام سکشن‌های یک پروژه
  async findAll(
    projectId: string,
    userId: string,
  ): Promise<Section[]> {

    return this.sectionRepo.find({
      where: {
        projectId,
        project: {
          userId,
        },
      },
      order: {
        orderIndex: 'ASC',
      },
    });
  }
  // دریافت یک سکشن
  async findOne(
    id: string,
    userId: string,
  ): Promise<Section> {

    const section = await this.sectionRepo.findOne({
      where: {
        id,
        project: {
          userId,
        },
      },
    });
    if (!section) {
      throw new NotFoundException(
        'سکشن مورد نظر پیدا نشد',
      );
    }
    return section;
  }
  // آپدیت خروجی AI برای سکشن
  async update(
    id: string,
    userId: string,
    dto: UpdateSectionDto,
  ): Promise<Section> {

    const section = await this.findOne(
      id,
      userId,
    );
    Object.assign(section, dto);
    return this.sectionRepo.save(section);
  }
  // حذف سکشن
  async remove(
    id: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const section = await this.findOne(
      id,
      userId,
    );
    await this.sectionRepo.remove(section);
    return {
      success: true,
    };
  }
}
