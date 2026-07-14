// Cấu hình hiển thị tài khoản ngân hàng cho các field copy tay bên cạnh QR.
// QR ảnh thật do BE dựng (dùng BANK_ID/BANK_ACCOUNT_NO trong .env) — 2 giá trị dưới
// đây chỉ để hiển thị text, phải khớp thủ công với Backend/.env.
export const BANK_CONFIG = {
  name: "MB Bank",
  accountNo: "0123456789",
  accountName: "ZINZA PLATFORM",
} as const;

export type BankConfig = typeof BANK_CONFIG;
