import {
  BadRequestException,
  Injectable,
  Logger,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Plan } from '../entity/plan.entity';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus } from '../enum/subscriptionstatus.enum';
import { UserRepository } from '../../user/repositories/user.repository';
import { SubscriptionRepository } from '../repository/subscription.repository';
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private stripe: Stripe;

  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {});
  }

  async createCheckoutSession(user, planId: number) {
    if (!user) {
      this.logger.error('User is undefined');
      throw new UnauthorizedException('Authentication required');
    }

    const existingUser = await this.userRepository.findOneBy({ id: user.sub });

    if (!user.sub || !user.email) {
      this.logger.error(`Invalid user object: ${JSON.stringify(user)}`);
      throw new BadRequestException('Invalid user data');
    }

    const plan = await this.planRepository.findOneBy({ id: planId });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Use user.sub instead of user.id
    const userId = String(user.sub);

    let stripeCustomerId = existingUser.stripe_customer_id;

    if (!existingUser.stripe_customer_id) {
      const customer = await this.stripe.customers.create({
        email: existingUser.email,
        name: existingUser.name,
      });

      stripeCustomerId = customer.id;

      existingUser.stripe_customer_id = stripeCustomerId;
      await this.userRepository.save(existingUser);
    }

    try {
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
        customer: stripeCustomerId,
        metadata: {
          userId: userId,
          planId: String(planId),
        },
        success_url: `${this.configService.get('BASE_URL')}/payment-success`,
        cancel_url: `${this.configService.get('BASE_URL')}/payment-cancel`,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      this.logger.error(`Stripe error: ${error.message}`);
      throw new BadRequestException(
        `Failed to create checkout session: ${error.message}`,
      );
    }
  }

  async handleWebhook(request: RawBodyRequest<Request>) {
    const signature = request.headers['stripe-signature'] as string;
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    if (!signature) {
      this.logger.error('Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET not set');
      throw new BadRequestException('Webhook secret not configured');
    }

    if (!request.rawBody) {
      this.logger.error('No raw body provided in webhook request');
      throw new BadRequestException('No webhook payload was provided');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook verification failed: ${err.message}`);
      throw new BadRequestException(
        `Webhook verification failed: ${err.message}`,
      );
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
          break;
      }
    } catch (err) {
      this.logger.error(`Webhook processing error: ${err.message}`, err.stack);
      throw new BadRequestException(
        `Webhook processing failed: ${err.message}`,
      );
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const subscriptionId = session.subscription as string;

    if (!userId || !planId || !subscriptionId) {
      this.logger.error('Missing metadata');
      throw new BadRequestException('Missing metadata');
    }

    const plan = await this.planRepository.findOneBy({ id: Number(planId) });
    const user = await this.userRepository.findOneBy({ id: Number(userId) });

    if (!plan || !user) {
      this.logger.error(
        `Plan or user not found - planId: ${planId}, userId: ${userId}`,
      );
      throw new BadRequestException('Plan or user not found');
    }

    // Fetch subscription details from Stripe
    let stripeSubscription: Stripe.Subscription;
    try {
      stripeSubscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (err) {
      this.logger.error(
        `Failed to retrieve Stripe subscription: ${err.message}`,
      );
      throw new BadRequestException(
        'Failed to retrieve subscription from Stripe',
      );
    }

    // Then try to find where the end date information is stored
    let endDate: Date | null = null;

    if ((stripeSubscription as any).current_period_end) {
      endDate = new Date((stripeSubscription as any).current_period_end * 1000);
    } else {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create new subscription
    const subscription = this.subscriptionRepository.create({
      stripe_subscription_id: subscriptionId,
      status: this.mapStripeStatus(stripeSubscription.status),
      end_date: endDate,
      user,
      plan,
    });

    // Save to database with error handling
    try {
      await this.subscriptionRepository.save(subscription);
    } catch (err) {
      this.logger.error(
        `Failed to save subscription: ${err.message}`,
        err.stack,
      );
      throw new BadRequestException(
        `Failed to save subscription: ${err.message}`,
      );
    }
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.SUCCESS;

      default:
        return SubscriptionStatus.PENDING;
    }
  }

  async getUserPaymentHistory(userId: number) {
    const subscriptions =
      await this.subscriptionRepository.getUserPaymentHistory(userId);

    const paymentHistory = await Promise.all(
      subscriptions.map(async (sub) => {
        let invoicePdfUrl: string | null = null;

        try {
          const stripeSub = await this.stripe.subscriptions.retrieve(
            sub.stripe_subscription_id,
            {
              expand: ['latest_invoice'],
            },
          );

          const latestInvoice = stripeSub.latest_invoice as Stripe.Invoice;

          if (latestInvoice?.invoice_pdf) {
            invoicePdfUrl = latestInvoice.invoice_pdf;
          }
        } catch (err) {
          this.logger.warn(
            `Could not fetch invoice for subscription ${sub.stripe_subscription_id}: ${err.message}`,
          );
        }

        return {
          plan_name: sub.plan.name,
          price: Number(sub.plan.price),
          wall_limit: sub.plan.wall_limit,
          status: sub.status,
          created_at: sub.created_at,
          end_date: sub.end_date,
          invoice_pdf: invoicePdfUrl,
        };
      }),
    );

    return paymentHistory;
  }

  async getActiveSubscription(userId: number) {
    const activeSub = await this.subscriptionRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.SUCCESS,
      },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });

    if (!activeSub) {
      throw new NotFoundException('No active subscription found');
    }

    return {
      plan_id: activeSub.plan.id,
      plan_name: activeSub.plan.name,
      wall_limit: activeSub.plan.wall_limit,
      price: activeSub.plan.price,
      start_date: activeSub.created_at,
      end_date: activeSub.end_date,
    };
  }
  async cancelUserSubscription(user) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    const userId = Number(user.sub);

    // Fetch active subscription
    const activeSub = await this.subscriptionRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.SUCCESS,
      },
      order: { created_at: 'DESC' },
    });

    if (!activeSub || !activeSub.stripe_subscription_id) {
      throw new NotFoundException('No active subscription found');
    }

    try {
      // Cancel at the end of the billing period (set to false if you want immediate cancellation)
      const canceledSubscription = await this.stripe.subscriptions.update(
        activeSub.stripe_subscription_id,
        { cancel_at_period_end: true },
      );

      // Update DB
      activeSub.status = SubscriptionStatus.CANCEL;
      await this.subscriptionRepository.save(activeSub);

      return {
        message: 'Subscription cancellation scheduled at period end',
        cancel_at: new Date(canceledSubscription.cancel_at * 1000),
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }
}
