import { IsNotEmpty, Min, IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  stripe_price_id: string;

  @IsNumber()
  wall_limit: number;
}
