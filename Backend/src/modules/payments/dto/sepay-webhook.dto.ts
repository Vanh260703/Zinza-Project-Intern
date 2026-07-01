// Cấu trúc payload SePay gửi về qua webhook
// Docs: https://my.sepay.vn/userapi/transactions/list
export class SepayWebhookDto {
  id: number;                  // ID giao dịch nội bộ của SePay
  gateway: string;             // Ngân hàng/ví: "MBBank", "Vietcombank"...
  transactionDate: string;     // "2024-01-01 12:00:00"
  accountNumber: string;       // Số tài khoản nhận tiền
  subAccount: string | null;
  code: string | null;         // Mã đơn trong nội dung CK (SePay tự parse ra)
  content: string;             // Nội dung chuyển khoản đầy đủ
  transferType: 'in' | 'out';  // 'in' = tiền vào, 'out' = tiền ra
  transferAmount: number;      // Số tiền VND
  accumulated: number;         // Số dư tài khoản sau giao dịch
  referenceCode: string;       // Mã tham chiếu từ ngân hàng
  description: string;
}
