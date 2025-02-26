import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ManyToOne } from "typeorm";
import { Wall } from "./wall.entity";
import { SocialPlatform } from "./social-platform.enum";

@Entity()
export class SocialLink {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    url: string;

    @Column({ type: 'enum', enum: SocialPlatform, nullable: false })
    platform: SocialPlatform;

    @ManyToOne(() => Wall, (wall) => wall.id, { onDelete: 'CASCADE' })
    wall: Wall;
}