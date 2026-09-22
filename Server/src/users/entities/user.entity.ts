import {
  Entity,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/base.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Project } from '../../projects/entities/project.entity';


@Entity('users')
export class User extends CustomBaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  phone: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}