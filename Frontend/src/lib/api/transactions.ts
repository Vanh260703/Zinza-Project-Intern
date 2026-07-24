import { apiFetch } from "./client";
import type { Transaction, TransactionType } from "@/types/transaction";

export type TransactionsQuery = {
  type?: TransactionType;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
};

export type TransactionsResponse = {
  data: Transaction[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export const transactionsApi = {
  list: (query: TransactionsQuery = {}): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    if (query.type) params.set("type", query.type);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return apiFetch(`/api/user/transactions${qs ? `?${qs}` : ""}`).then((r) => r.json());
  },
};
