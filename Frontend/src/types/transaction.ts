export type TransactionType = "topup" | "spend" | "refund" | "bonus" | "gift" | "earn";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number; // dương = cộng kẹo, âm = trừ kẹo
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string;
  createdAt: string;
};
