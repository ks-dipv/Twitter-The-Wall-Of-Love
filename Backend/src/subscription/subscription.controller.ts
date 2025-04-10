import { Controller } from '@nestjs/common';
import { Post, Param, Req } from '@nestjs/common';
import { SubscriptionService } from './service/subscription.service';
import { User } from 'src/common/decorator/user.decorater';
@Controller('subscription')
export class SubscriptionController {

    constructor(private readonly subscriptionService: SubscriptionService) {}


    @Post('checkout/:planId')
    createCheckoutSession(
      @User() user,
      @Param('planId') planId: number,
    ) {
      return this.subscriptionService.createCheckoutSession(user, planId);
    }
    
}
