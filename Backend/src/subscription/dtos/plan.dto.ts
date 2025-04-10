import { IsNotEmpty, Min,IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  stripePriceId: string; 

  @IsNumber()
  wallLimit: number;
}
