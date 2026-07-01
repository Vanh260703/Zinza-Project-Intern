import { IsInt, IsPositive } from 'class-validator';

export class CreatePaymentOrderDto {
  // Số tiền VND user muốn nạp
  // Hệ thống sẽ tính candyAmount dựa theo tỷ giá (VD: 1000 VND = 10 candy)
  @IsInt()
  @IsPositive()
  amountVnd: number;
}
