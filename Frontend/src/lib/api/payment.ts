import { apiFetch } from "./client";
import type { CandyPackage, PaymentOrder, PaymentOrderStatus } from "@/types/payment";

export const paymentApi = {
  getCandyPackages: (): Promise<CandyPackage[]> =>
    apiFetch("/api/payments/candy-packages").then((r) => r.json()),

  createOrder: (packageId: string): Promise<PaymentOrder> =>
    apiFetch("/api/payments/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.message ?? "Tạo đơn nạp thất bại");
      return json;
    }),

  getOrder: (orderId: string): Promise<PaymentOrderStatus> =>
    apiFetch(`/api/payments/orders/${orderId}`).then((r) => r.json()),
};
