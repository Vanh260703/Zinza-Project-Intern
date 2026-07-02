import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

// Cấu trúc payload SePay gửi về qua webhook
export class SepayWebhookDto {
  @IsNumber()
  id: number;

  @IsString()
  gateway: string;

  @IsString()
  transactionDate: string;

  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  subAccount: string | null;

  // Mã đơn mà tay tự parse từ nội dung CK — rỗng nếu không nhận ra
  @IsOptional()
  @IsString()
  code: string | null;

  @IsString()
  content: string;

  @IsIn(['in', 'out'])
  transferType: 'in' | 'out';

  @IsString()
  description: string;

  @IsNumber()
  transferAmount: number;

  @IsString()
  referenceCode: string;

  @IsNumber()
  accumulated: number;
}
