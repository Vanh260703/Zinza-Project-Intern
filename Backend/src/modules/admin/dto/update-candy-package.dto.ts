import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCandyPackageDto {
  @IsOptional()
  @IsInt()
  @Min(1000)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  candy?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
