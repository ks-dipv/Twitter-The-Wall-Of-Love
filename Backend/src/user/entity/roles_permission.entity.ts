import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Roles } from './roles.entity';
import { Permission } from './permission.entity';
@Entity('role_permissiomn')
export class Rolespermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Roles, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
