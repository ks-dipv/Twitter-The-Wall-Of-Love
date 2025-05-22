import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Wall } from 'src/wall/entity/wall.entity';
import { AccessType } from '../enum/access-type.enum';
import { User } from 'src/user/entity/user.entity';
@Entity()
export class WallAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userWallAccess, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @ManyToOne(() => User, (assigned) => assigned.WallAccess, {
    onDelete: 'CASCADE',
    eager: true,
  })
  assigned_by: User;

  @ManyToOne(() => Wall, (wall) => wall.wallAccesses, {
    onDelete: 'CASCADE',
    eager: true,
  })
  wall: Wall;

  @Column({
    type: 'enum',
    enum: AccessType,
  })
  access_type?: AccessType;

  @CreateDateColumn()
  created_at: Date;
}
