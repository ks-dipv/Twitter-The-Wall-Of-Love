import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Subscription } from '../entity/subscription.entity';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(private dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager());
  }

  async getUserPaymentHistory(userId: number) {
    const subscriptions = await this.find({
      where: { user: { id: userId } },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });

    return subscriptions.map((sub) => ({
      plan_name: sub.plan.name,
      price: Number(sub.plan.price),
      wall_limit: sub.plan.wall_limit,
      status: sub.status,
      created_at: sub.created_at,
      end_date: sub.end_date,
    }));
  }
}
