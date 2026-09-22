import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  // ۱. ساخت پروژه جدید
  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create({
      ...dto,
      userId,
    }); 
    console.log(project)
    
    return this.projectRepo.save(project);
  }

  // ۲. دریافت لیست پروژه‌های کاربر لاگین‌شده (برای داشبورد)
  async findAll(userId: string): Promise<Project[]> {
    return this.projectRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ۳. باز کردن ادیتور پروژه (لود پروژه + سکشن‌های آن به ترتیب)
 async findOne(id: string, userId: string): Promise<Project> {
  const project = await this.projectRepo.findOne({
    where: { id, userId },
    relations: {
      sections: true,
    },
    order: {
      sections: {
        orderIndex: 'ASC',
      },
    },
  });

  if (!project) {
    throw new NotFoundException('پروژه مورد نظر یافت نشد');
  }

  return project;
}
  // ۴. حذف پروژه (تمام سکشن‌ها به صورت CASCADE پاک می‌شوند)
  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    const project = await this.findOne(id, userId);
    await this.projectRepo.remove(project);
    return { success: true };
  }
}