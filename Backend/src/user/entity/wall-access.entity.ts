import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';
import { Wall } from 'src/wall/entity/wall.entity';
import { AccessType } from '../enum/accesstype.enum';
@Entity()
export class WallAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userWallAccess, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, (assigned) => assigned.WallAccess, {
    onDelete: 'CASCADE',
  })
  assigned_by: User;

  @ManyToOne(() => Wall, (wall) => wall.wallAccesses, { onDelete: 'CASCADE' })
  wall: Wall;

  @Column({
    type: 'enum',
    enum: AccessType,
    // default: AccessType.ADMIN,
  })
  access_type?: AccessType;

  @CreateDateColumn()
  created_at: Date;
}
