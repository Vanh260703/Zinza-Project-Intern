import { IsInt, Min } from 'class-validator';

export class GiftCandyDto {
  @IsInt()
  @Min(1)
  amount: number;
}
