export enum TransactionType {
  TOPUP = 'topup', // Nạp tiền → cộng candy
  SPEND = 'spend', // Mua chapter → trừ candy
  REFUND = 'refund', // Hoàn tiền
  BONUS = 'bonus', // Admin tặng candy
  GIFT = 'gift', // Tặng kẹo cho truyện
  EARN = 'earn', // Nhận kẹo từ tặng / mở khoá chương (về ví người đăng)
}
