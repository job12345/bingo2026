import { IsInt, Min, Max } from 'class-validator';

export class BuyCardsDto {
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
