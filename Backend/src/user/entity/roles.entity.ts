import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Rolespermission } from './roles_permission.entity';
import { User } from './user.entity';
@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Rolespermission, (rolePermission) => rolePermission.role)
  rolePermissions: Rolespermission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
