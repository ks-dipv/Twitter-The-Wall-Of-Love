import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ManyToOne } from 'typeorm';
import { AccessType } from '../enum/access-type.enum';
import { User } from 'src/user/entity/user.entity';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({
    type: 'enum',
    enum: AccessType,
  })
  access_type: AccessType;

  @ManyToOne(() => User, (user) => user.invitations, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
