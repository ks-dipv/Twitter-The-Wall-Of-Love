import { Controller, RawBodyRequest, Req } from '@nestjs/common';
import { Post, Param, Get, Patch } from '@nestjs/common';
import { SubscriptionService } from './service/subscription.service';
import { User } from '../common/decorator/user.decorator';
import { Auth } from '../common/decorator/auth.decorator';
import { AuthType } from '../common/enum/auth-type.enum';

@Controller('api/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('checkout/:planId')
  createCheckoutSession(@User() user, @Param('planId') planId: number) {
    return this.subscriptionService.createCheckoutSession(user, planId);
  }

  @Post('webhook')
  @Auth(AuthType.None)
  handleWebhook(@Req() request: RawBodyRequest<Request>) {
    return this.subscriptionService.handleWebhook(request);
  }

  @Get('history')
  getPaymentHistory(@User() user) {
    return this.subscriptionService.getUserPaymentHistory(user.sub);
  }
  @Get('active')
  async getActiveSubscription(@Req() req) {
    const userId = req.user.id;
    return this.subscriptionService.getActiveSubscription(userId);
  }
  @Patch('cancel')
  async cancelSubscription(@Req() req) {
    return this.subscriptionService.cancelUserSubscription(req.user);
  }
}
