import { Entity } from "typeorm";
import { Column, PrimaryGeneratedColumn , CreateDateColumn,UpdateDateColumn,DeleteDateColumn} from "typeorm";

@Entity()
 
export  class User{

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    username: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column({ unique: true, nullable: true })
    twitter_id: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt?: Date;
  
}