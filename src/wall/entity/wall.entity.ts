import { User } from 'src/user/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WallVisibility } from './wall-visibility.enum';
@Entity()
export class Wall {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 250, nullable: false })
    title: string;

    @Column({ type:'varchar',nullable: true })
    logo?: string;

    @Column({ type: 'varchar',length: 250, nullable: true })
    description?: string;

    @Column({ type: 'enum', enum: WallVisibility, default: WallVisibility.PUBLIC })
    visibility: WallVisibility;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => User, (user) => user.walls, { onDelete: 'CASCADE' })
    user: User;

}
