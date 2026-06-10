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
  amount: number;
  candyReceived: number;
  status: PaymentStatus;
  transferContent: string;
  createdAt: string;
  completedAt?: string;
};
