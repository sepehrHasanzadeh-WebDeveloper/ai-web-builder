import {
  Entity,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/base.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity('users')
export class User extends CustomBaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  phone: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}