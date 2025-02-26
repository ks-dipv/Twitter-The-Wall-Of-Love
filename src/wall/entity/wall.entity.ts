import { User } from 'src/user/entity/user.entity';
import { v4 as uuidv4 } from 'uuid';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { SocialLink } from './social-links.entity';
import { Tweets } from './tweets.entity';
@Entity()
export class Wall {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 250, nullable: false })
    title: string;

    @Column({ type: 'varchar', nullable: true })
    logo?: string;

    @Column({ type: 'varchar', length: 250, nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: WallVisibility,
        default: WallVisibility.PUBLIC,
    })
    visibility: WallVisibility;

    @Column({ type: 'varchar', unique: true, nullable: true })
    shareable_link?: string;

    @Column({ type: 'varchar', unique: true, nullable: true })
    embed_link?: string;

    generateLinks() {
        const uniqueId = uuidv4();
        this.shareable_link = uniqueId; // Store only the unique ID
        this.embed_link = `<iframe src="https://yourdomain.com/walls/embed/${uniqueId}" width="600" height="400"></iframe>`;
    }
    

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => SocialLink, (link) => link.wall)
    social_link: SocialLink[];

    @OneToMany(() => Tweets, (tweet) => tweet.wall)
    tweets: Tweets[];

    @ManyToOne(() => User, (user) => user.walls)
    user: User;
}
