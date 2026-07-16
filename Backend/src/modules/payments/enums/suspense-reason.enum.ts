export enum SuspenseReason {
  // Tiền vào thật (transferType='in') nhưng nội dung CK không parse ra được mã đơn nào
  NO_ORDER_CODE = 'no_order_code',

  ORDER_NOT_FOUND = 'order_not_found', // order không khớp orderCode
  ORDER_NOT_PENDING = 'order_not_pending', // Tìm đúng order nhưng status không còn PENDING
  AMOUNT_MISMATCH = 'amount_mismatch', // Số tiền không khớp
  ORDER_EXPIRED = 'order_expired', // Order quá hạn
  PROCESSING_ERROR = 'processing_error', // Webhook bị crash

  BALANCE_SUM_MISMATCH = 'balance_sum_mismatch', // wallet.balance != SUM(wallet_transactions)
  MISSING_PAIR = 'missing_pair', // GIFT thiếu EARN tương ứng (hoặc ngược lại)
  BALANCE_CHAIN_MISMATCH = 'balance_chain_mismatch', // balanceBefore/After giữa các dòng đứt gãy
}
