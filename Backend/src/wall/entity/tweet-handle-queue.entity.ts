import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Wall } from './wall.entity';

@Entity()
export class TweetHandleQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ default: false })
  processed: boolean;

  @ManyToOne(() => Wall, (wall) => wall.handleQueue)
  wall: Wall;
}
