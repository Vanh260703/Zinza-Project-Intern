export type PaymentPackage = {
  id: string;
  price: number;
  candy: number;
  bonus: number;
  badge?: string;
};

export const PAYMENT_PACKAGES: PaymentPackage[] = [
  { id: "p1", price: 20_000, candy: 200, bonus: 0 },
  { id: "p2", price: 50_000, candy: 550, bonus: 50 },
  { id: "p3", price: 100_000, candy: 1_200, bonus: 200, badge: "Phổ biến" },
  { id: "p4", price: 200_000, candy: 2_600, bonus: 600 },
  { id: "p5", price: 500_000, candy: 7_000, bonus: 2_000, badge: "Giá trị nhất" },
  { id: "p6", price: 1_000_000, candy: 15_000, bonus: 5_000 },
];

export const BANK_CONFIG = {
  name: "MB Bank",
  code: "MB",
  accountNo: "0123456789",
  accountName: "ZINZA PLATFORM",
} as const;

// Prefix nội dung chuyển khoản để SePay auto-match
export const TRANSFER_PREFIX = "NAPKEO";
