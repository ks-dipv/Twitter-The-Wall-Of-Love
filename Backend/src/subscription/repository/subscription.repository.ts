import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Subscription } from '../entity/subscription.entity';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(private dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager());
  }

  async getUserPaymentHistory(userId: number) {
    return this.find({
      where: { user: { id: userId } },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });
  }
    
}
