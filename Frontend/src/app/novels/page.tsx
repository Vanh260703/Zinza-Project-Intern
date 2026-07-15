import NovelsPage from "@/components/novels/NovelsPage";
import { homeApi } from "@/lib/api/home";

type SearchParams = { q?: string; genre?: string; status?: string; sort?: string };

// FE dùng latest/views/rating → BE dùng newest/views/rating
const SORT_MAP: Record<string, string> = {
  latest: "newest",
  views: "views",
  rating: "rating",
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.genre) sp.set("category", params.genre); // BE lọc theo category slug
  if (params.status) sp.set("status", params.status);
  if (params.sort) sp.set("sort", SORT_MAP[params.sort] ?? params.sort);
  sp.set("limit", "60");

  const novels = await homeApi.list(sp.toString());

  return (
    <NovelsPage
      novels={novels}
      q={params.q}
      genre={params.genre}
      status={params.status}
      sort={params.sort}
    />
  );
}
