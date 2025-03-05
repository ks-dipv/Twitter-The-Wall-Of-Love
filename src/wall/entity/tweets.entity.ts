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

  @Column({ type: 'varchar', length: 200, nullable: false, unique: true })
  tweet_url: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  author_name: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  author_profile_link: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author_profile_pic?: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  comments: number;

  @Column({ default: 0 })
  order_index: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Wall, (wall) => wall.tweets, { onDelete: 'CASCADE' })
  wall: Wall;
}
