import { Entity } from 'typeorm';
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wall } from 'src/wall/entity/wall.entity';
import { OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Exclude()
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  profile_pic?: string;

  @Column({ type: 'varchar', nullable: true })
  reset_password_token?: string;

  @Column({ nullable: true, unique: true })
  api_token?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Wall, (wall) => wall.user)
  walls: Wall[];
}
