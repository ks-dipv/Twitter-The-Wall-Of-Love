import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AccessType } from '../enum/accesstype.enum';
@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
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
