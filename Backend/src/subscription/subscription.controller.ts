import { Controller } from '@nestjs/common';
import { Post, Param, Body,Req, Headers, BadRequestException } from '@nestjs/common';
import { SubscriptionService } from './service/subscription.service';
import { User } from 'src/common/decorator/user.decorater';
import Stripe from 'stripe';
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

    @Post('webhook')
    async handleStripeWebhook(
      @Body() body: any,
      @Headers('stripe-signature') sig: string,
    ) {
      const webhookSecret =
        this.subscriptionService.getStripeWebhookSecret();
  
      let event: Stripe.Event;
  
      try {
        event = this.subscriptionService.verifyStripeWebhook(body, sig, webhookSecret);
      } catch (err) {
        console.log('Webhook Error:', err.message);
        throw new BadRequestException(`Webhook Error: ${err.message}`);
      }
  
      await this.subscriptionService.handleWebhookEvent(event);
  
      return { received: true };
    }
    
}
