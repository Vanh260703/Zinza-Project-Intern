import { PAYMENT_PACKAGES, BANK_CONFIG, TRANSFER_PREFIX } from "@/config/payment";
import type { PaymentPackage, Payment } from "@/types/payment";
import paymentsData from "@/lib/data/payments.json";

export type { PaymentPackage, Payment };

const MOCK_PAYMENTS = paymentsData as Payment[];

export type BankConfig = typeof BANK_CONFIG;

// ─── Khi switch sang BE: chỉ thay 2 hàm này ─────────────────────────────────
// Hiện tại: trả data từ config tĩnh
// Tương lai: fetch("/api/payment/config") rồi return data

export async function getPaymentPackages(): Promise<PaymentPackage[]> {
  // TODO (BE): return fetch("/api/payment/packages").then(r => r.json())
  return PAYMENT_PACKAGES;
}

export async function getBankConfig(): Promise<BankConfig> {
  // TODO (BE): return fetch("/api/payment/bank").then(r => r.json())
  return BANK_CONFIG;
}

export function buildTransferContent(userId: string, packageId: string): string {
  return `${TRANSFER_PREFIX} ${userId.slice(0, 8).toUpperCase()} ${packageId.toUpperCase()}`;
}

export async function getPaymentHistory(userId?: string): Promise<Payment[]> {
  // TODO (BE): return fetch(`/api/payment/history?userId=${userId}`).then(r => r.json())
  const data = userId ? MOCK_PAYMENTS.filter((p) => p.userId === userId) : MOCK_PAYMENTS;
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
