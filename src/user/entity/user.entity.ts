import { Entity } from "typeorm";
import { Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Wall } from "src/wall/entity/wall.entity";
import { OneToMany } from "typeorm";
@Entity('users')

export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({  type:'varchar' ,length: 100, nullable: false,unique: true })
    name: string;

    @Column({ type:'varchar' ,length:100, nullable: false,unique: true })
    email: string;

    @Column({type: 'varchar', length: 100, nullable: false})
    password: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    resetPasswordToken?: string;

    @Column({ unique: true, nullable: true })
    twitter_id: string;

    @CreateDateColumn({ name: 'create_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at' })
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(() => Wall, (wall) => wall.user)
    walls: Wall[];

}