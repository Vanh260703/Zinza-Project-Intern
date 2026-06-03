import {
  PAYMENT_PACKAGES,
  BANK_CONFIG,
  TRANSFER_PREFIX,
  type PaymentPackage,
} from "@/config/payment";

export type { PaymentPackage };

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
