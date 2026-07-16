import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { SuspenseStatus } from 'src/modules/payments/enums/suspense-status.enum';

// Admin chỉ được chuyển UNRESOLVED -> RESOLVED/ACCEPTED/REFUNDED, không cho set lại UNRESOLVED
const RESOLVABLE_STATUSES = [
  SuspenseStatus.RESOLVED,
  SuspenseStatus.ACCEPTED,
  SuspenseStatus.REFUNDED,
];

export class ResolveSuspenseTransactionDto {
  @IsIn(RESOLVABLE_STATUSES)
  status:
    | SuspenseStatus.RESOLVED
    | SuspenseStatus.ACCEPTED
    | SuspenseStatus.REFUNDED;

  @IsString()
  resolutionNote: string;

  // Chỉ dùng cho 6 reason SePay (không có số tính sẵn) — reason missing_pair sẽ bị
  // service bỏ qua field này (server tự tính), balance_sum/balance_chain thì bị chặn hẳn.
  @IsOptional()
  @IsUUID()
  creditUserId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  creditAmount?: number;
}
