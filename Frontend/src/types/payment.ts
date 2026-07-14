export type PaymentStatus = "pending" | "completed" | "failed" | "expired";

export type CandyPackage = {
  id: string;
  price: number;
  candy: number;
  bonus: number;
  badge: string | null;
};

// Response tạo đơn — POST /payments/orders
export type PaymentOrder = {
  orderId: string;
  orderCode: string;
  amountVnd: number;
  candyAmount: number;
  expiredAt: string;
  qrUrl: string;
};

// Response xem trạng thái đơn — GET /payments/orders/:orderId
export type PaymentOrderStatus = {
  id: string;
  orderCode: string;
  amountVnd: number;
  candyAmount: number;
  status: PaymentStatus;
  expiredAt: string;
  paidAt: string | null;
};
