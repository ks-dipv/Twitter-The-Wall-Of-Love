import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Plan } from '../entity/plan.entity';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {});
  }

  async createCheckoutSession(user, planId: number) {
    const plan = await this.planRepository.findOneBy({ id: planId });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: plan.name,
            },
            unit_amount: Math.round(Number(plan.price) * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: String(user.id),
        planId: String(plan.id),
      },
      success_url: `${this.configService.get('BASE_URL')}/payment-success`,
      cancel_url: `${this.configService.get('BASE_URL')}/payment-cancel`,
    });

    return {
      url: session.url,
    };
  }

  getStripeWebhookSecret() {
    return this.configService.get('STRIPE_WEBHOOK_SECRET');
  }

  verifyStripeWebhook(body: any, sig: string, webhookSecret: string) {
    return this.stripe.webhooks.constructEvent(
      JSON.stringify(body),
      sig,
      webhookSecret,
    );
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Payment Success for UserId:', session.metadata.userId);
        console.log('Subscribed PlanId:', session.metadata.planId);

        // TODO: Store payment in DB
        // TODO: Update User Subscription Status
        break;
      }

      case 'invoice.payment_failed': {
        const session = event.data.object as Stripe.Invoice;

        console.log('Payment Failed for Customer:', session.customer_email);

        // TODO: Update user subscription as failed
        break;
      }

      default:
        console.log(`Unhandled Event Type ${event.type}`);
    }
  }
}
