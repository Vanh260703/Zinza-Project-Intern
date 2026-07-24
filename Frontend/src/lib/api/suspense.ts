import { apiFetch } from "./client";
import type { SuspenseReason, SuspenseStatus, SuspenseTransaction } from "@/types/suspense";

export type SuspenseQuery = {
  status?: SuspenseStatus;
  reason?: SuspenseReason;
  page?: number;
  limit?: number;
};

export type SuspenseListResponse = {
  data: SuspenseTransaction[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type ResolveSuspensePayload = {
  status: "resolved" | "accepted" | "refunded";
  resolutionNote: string;
  creditUserId?: string;
  creditAmount?: number;
};

export const suspenseApi = {
  list: (query: SuspenseQuery = {}): Promise<SuspenseListResponse> => {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.reason) params.set("reason", query.reason);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return apiFetch(`/api/admin/suspense-transactions${qs ? `?${qs}` : ""}`).then((r) =>
      r.json()
    );
  },

  resolve: async (id: string, payload: ResolveSuspensePayload): Promise<SuspenseTransaction> => {
    const res = await apiFetch(`/api/admin/suspense-transactions/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Xử lý thất bại");
    return json;
  },
};
