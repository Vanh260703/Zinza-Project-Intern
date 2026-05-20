import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SearchResultsSection from "@/components/home/SearchResultsSection";
import { db } from "@/lib/mock-db";
import { removeDiacritics } from "@/utils/removeDiacritics";
import type { Story } from "@/types/story";

const GENRE_MAP: Record<string, string> = {
  "tien-hiep": "Tiên hiệp",
  "huyen-huyen": "Huyền huyễn",
  "vo-hiep": "Võ hiệp",
  "do-thi": "Đô thị",
  "lich-su": "Lịch sử",
};

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
    const genreNorm = removeDiacritics(GENRE_MAP[params.genre] ?? params.genre);
    result = result.filter((s) => s.genres.some((g) => removeDiacritics(g) === genreNorm));
  }

  if (params.status) {
    result = result.filter((s) => s.status === params.status);
  }

  if (params.sort === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (params.sort === "views") {
    result.sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0));
  }

  return result;
}

export default async function NovelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const results = filterAndSort(db.stories.getAll(), params);

  return (
    <div className="min-h-screen bg-stone-950">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SearchResultsSection
          stories={results}
          q={params.q}
          genre={params.genre}
          status={params.status}
          sort={params.sort}
        />
      </div>
      <Footer />
    </div>
  );
}
