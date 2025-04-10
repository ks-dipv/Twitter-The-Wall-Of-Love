import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubscriptionStatus } from '../enum/subscriptionstatus.enum';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  stripe_subscription_id: string;

  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  plan_id: number;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  end_date?: Date;
}
