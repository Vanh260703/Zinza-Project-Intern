import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";

// Thể loại hiếm khi đổi → staleTime dài, tránh refetch mỗi lần mở form tạo truyện.
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}
