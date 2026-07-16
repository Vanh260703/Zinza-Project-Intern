import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suspenseApi, type ResolveSuspensePayload, type SuspenseQuery } from "@/lib/api/suspense";

export function useSuspenseTransactions(query: SuspenseQuery) {
  return useQuery({
    queryKey: ["admin-suspense-transactions", query],
    queryFn: () => suspenseApi.list(query),
  });
}

export function useResolveSuspense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveSuspensePayload }) =>
      suspenseApi.resolve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suspense-transactions"] });
    },
  });
}
