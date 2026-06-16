import { db } from "@/lib/mock-db";
import { removeDiacritics } from "@/utils/removeDiacritics";
import type { Story } from "@/types/story";
import NovelsPage from "@/components/novels/NovelsPage";

type SearchParams = { q?: string; genre?: string; status?: string; sort?: string };

function filterAndSort(stories: Story[], params: SearchParams): Story[] {
  let result = [...stories];
  if (params.q) {
    const q = removeDiacritics(params.q);
    result = result.filter(
      (s) => removeDiacritics(s.name).includes(q) || removeDiacritics(s.author).includes(q)
    );
  }
  if (params.genre) {
    result = result.filter((s) => s.genres.some((g) => g.slug === params.genre));
  }
  if (params.status) {
    result = result.filter((s) => s.status === params.status);
  }
  if (params.sort === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (params.sort === "views") {
    result.sort((a, b) => b.nominations - a.nominations);
  } else if (params.sort === "latest") {
    result.reverse();
  }
  return result;
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const results = filterAndSort(db.stories.getAll(), params);
  return (
    <NovelsPage
      stories={results}
      q={params.q}
      genre={params.genre}
      status={params.status}
      sort={params.sort}
    />
  );
}
