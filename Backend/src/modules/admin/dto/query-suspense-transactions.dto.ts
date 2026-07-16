import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SuspenseStatus } from 'src/modules/payments/enums/suspense-status.enum';
import { SuspenseReason } from 'src/modules/payments/enums/suspense-reason.enum';

export class QuerySuspenseTransactionsDto {
  @IsOptional()
  @IsEnum(SuspenseStatus)
  status?: SuspenseStatus;

  @IsOptional()
  @IsEnum(SuspenseReason)
  reason?: SuspenseReason;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
