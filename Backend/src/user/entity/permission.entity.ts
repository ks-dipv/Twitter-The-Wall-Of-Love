import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Rolespermission } from './roles_permission.entity';
@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @OneToMany(
    () => Rolespermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: Rolespermission[];
}
