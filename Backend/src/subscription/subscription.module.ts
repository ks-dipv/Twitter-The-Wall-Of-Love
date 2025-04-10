import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './service/subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entity/plan.entity';
import { Subscription } from './entity/subscription.entity';
import { PlanController } from './plan.controller';
import { PlanService } from './service/plan.service';
@Module({
  imports: [TypeOrmModule.forFeature([Plan, Subscription])],
  controllers: [SubscriptionController, PlanController],
  providers: [SubscriptionService, PlanService],
})
export class SubscriptionModule {}
