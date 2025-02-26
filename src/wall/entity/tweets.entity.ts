import { Entity } from "typeorm";
import { PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Wall } from "./wall.entity";
@Entity()
export class Tweets {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 200, unique: true, nullable: false })
    tweetUrl: string;

    @Column({ type: 'text', nullable: false })
    content: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    authorName: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    authorProfileImage?: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    authorProfileLink?: string;

    @Column({ type: 'int', default: 0 })
    likes: number;

    @Column({ type: 'int', default: 0 })
    comments: number;

    @CreateDateColumn({ name: 'create_at' })
    createdAt: Date;

    @ManyToOne(() => Wall, (wall) => wall.id, { onDelete: 'CASCADE' })
    wall: Wall;
}