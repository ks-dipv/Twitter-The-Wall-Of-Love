import { User } from 'src/user/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class Wall {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    title: string;

    @Column({ nullable: true })
    logo: string;

    @Column({ length: 250, nullable: true })
    description: string;

    @Column({ type: 'enum', enum: ['public', 'private'], default: 'public' })
    visibility: 'public' | 'private';

    @ManyToOne(() => User, (user) => user.walls, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


}
