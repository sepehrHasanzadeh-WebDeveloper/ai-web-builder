import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findOrCreate(data: { phone: string }): Promise<{ user: User; isNewUser: boolean }> {
    let user = await this.findByPhone(data.phone);
    let isNewUser = false;

    if (!user) {
      user = this.userRepository.create({ phone: data.phone });
      user = await this.userRepository.save(user);
      isNewUser = true;
    }

    return { user, isNewUser };
  }
}