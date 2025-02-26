import { Entity } from 'typeorm';
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Wall } from './wall.entity';
@Entity()
export class Tweets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, unique: true, nullable: false })
  tweet_url: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  author_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  author_profile_image?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author_profile_link?: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  comments: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Wall, (wall) => wall.tweets, { onDelete: 'CASCADE' })
  wall: Wall;
}
