import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Plan } from '../entity/plan.entity';
import { ConfigService } from '@nestjs/config';
import { Subscription } from '../entity/subscription.entity';
import { SubscriptionStatus } from '../enum/subscriptionstatus.enum';
import { UserRepository } from 'src/user/repositories/user.repository';
@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
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
  
        console.log(' Received checkout.session.completed');
        console.log(' Metadata:', session.metadata);
  
        const userId = Number(session.metadata?.userId);
        const planId = Number(session.metadata?.planId);
        const stripeSubscriptionId = session.subscription as string;
  
        if (!userId || !planId || !stripeSubscriptionId) {
          console.log(' Missing metadata or subscription ID');
          return;
        }
  
        //  Fetch user and plan entities
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const plan = await this.planRepository.findOne({ where: { id: planId } });
  
        if (!user || !plan) {
          console.log(' User or Plan not found in database');
          return;
        }
  
        //  Create subscription entity
        const subscription = this.subscriptionRepository.create({
          stripe_subscription_id: stripeSubscriptionId,
          status: SubscriptionStatus.SUCCESS,
          user,
          plan,
        });
  
        await this.subscriptionRepository.save(subscription);
  
        console.log(` Subscription saved for user ${user.id}, plan ${plan.id}`);
        break;
      }
  
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
  
        console.log(' Payment Failed for Invoice');
  
        const stripeSubscriptionId = invoice.subscription as string;
  
        if (stripeSubscriptionId) {
          await this.subscriptionRepository.update(
            { stripe_subscription_id: stripeSubscriptionId },
            { status: SubscriptionStatus.FAIL },
          );
  
          console.log(` Marked subscription ${stripeSubscriptionId} as FAILED`);
        }
  
        break;
      }
  
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
  
}
