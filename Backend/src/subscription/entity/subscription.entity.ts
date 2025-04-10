import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Plan } from './plan.entity';
import { SubscriptionStatus } from '../enum/subscriptionstatus.enum';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stripe_subscription_id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    eager: true,
  })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, {
    eager: true,
  })
  plan: Plan;
}
