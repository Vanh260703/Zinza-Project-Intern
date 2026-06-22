export type PaymentStatus = "completed" | "pending" | "failed";

export type PaymentPackage = {
  id: string;
  price: number;
  candy: number;
  bonus: number;
  badge?: string;
};

export type Payment = {
  id: string;
  userId: string;
  packageId: string;
  amountVnd: number;
  candyAmount: number;
  status: PaymentStatus;
  orderCode: string;
  createdAt: string;
  completedAt?: string;
};
