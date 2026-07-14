import { useQuery } from "@tanstack/react-query";
import { transactionsApi, type TransactionsQuery } from "@/lib/api/transactions";

export function useTransactions(query: TransactionsQuery) {
  return useQuery({
    queryKey: ["transactions", query],
    queryFn: () => transactionsApi.list(query),
  });
}
