import { User } from 'src/user/entity/user.entity';
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => SocialLink, (socialLink) => socialLink.wall, {
    eager: true,
  })
  social_links: SocialLink[];

  @OneToMany(() => Tweets, (tweet) => tweet.wall)
  tweets: Tweets[];

  @ManyToOne(() => User, (user) => user.walls, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;
}
