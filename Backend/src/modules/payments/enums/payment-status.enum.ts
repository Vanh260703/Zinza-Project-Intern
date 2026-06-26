export enum PaymentStatus {
  PENDING = 'pending', // Đơn vừa tạo, chờ user chuyển khoản
  COMPLETED = 'completed', // SePay xác nhận đã nhận tiền
  FAILED = 'failed', // Giao dịch thất bại
  EXPIRED = 'expired', // Hết thời gian thanh toán (VD: 15 phút)
}
