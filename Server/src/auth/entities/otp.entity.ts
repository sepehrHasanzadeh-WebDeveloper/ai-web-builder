import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/base.entity';

@Entity('otps')
export class Otp extends CustomBaseEntity {
  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ type: 'varchar', nullable: false })
  code: string;

  @Column({ type: 'timestamp', nullable: false })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;
}