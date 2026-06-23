import { useQuery } from "@tanstack/react-query";
import { storiesApi } from "@/lib/api/stories";

export function useStoriesByIds(ids: string[], enabled = true) {
  return useQuery({
    queryKey: ["stories-by-ids", ids.join(",")],
    queryFn: () => storiesApi.getByIds(ids),
    enabled: enabled && ids.length > 0,
  });
}
