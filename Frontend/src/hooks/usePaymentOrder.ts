import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/payment";
import { showToast } from "@/lib/toast";

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (packageId: string) => paymentApi.createOrder(packageId),
    onError: (e: Error) => showToast.error(e.message ?? "Tạo đơn nạp thất bại"),
  });
}

const POLL_INTERVAL_MS = 3000;

export function usePaymentOrderStatus(orderId: string | null) {
  return useQuery({
    queryKey: ["payment-order", orderId],
    queryFn: () => paymentApi.getOrder(orderId!),
    enabled: !!orderId,
    refetchInterval: (query) => (query.state.data?.status === "pending" ? POLL_INTERVAL_MS : false),
  });
}
