export enum SuspenseStatus {
  UNRESOLVED = 'unresolved', // Case đang mở, cần admin xử lý

  // Đã verify sửa xong thật (dữ liệu gốc đã đúng lại)
  RESOLVED = 'resolved',

  // Admin đã biết, chủ động không sửa (case hiếm gặp, không đáng công điều
  // tra, hoặc benign)
  ACCEPTED = 'accepted',

  // Riêng case SePay: tiền vào không xác định được chủ, admin đã tự chuyển
  // khoản hoàn tiền tay qua ngân hàng (ngoài hệ thống).
  REFUNDED = 'refunded',
}
