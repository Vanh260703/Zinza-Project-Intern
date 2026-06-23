export enum NotificationType {
  // Truyện đang theo dõi có chương mới
  NEW_CHAPTER = 'new_chapter',

  // Ai đó bình luận trên truyện của bạn (dành cho tác giả)
  NEW_COMMENT = 'new_comment',

  // Nạp tiền (candy) thành công qua SePay
  PAYMENT_SUCCESS = 'payment_success',

  // Thông báo từ admin: bảo trì, sự kiện, khuyến mãi...
  SYSTEM = 'system',
}
