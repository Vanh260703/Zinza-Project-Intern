import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SearchResultsSection from "@/components/home/SearchResultsSection";
import type { Story } from "@/types/story";

type Props = {
  stories: Story[];
  q?: string;
  genre?: string;
  status?: string;
  sort?: string;
};

export default function NovelsPage({ stories, q, genre, status, sort }: Props) {
  return (
    <div className="min-h-screen bg-stone-950">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SearchResultsSection stories={stories} q={q} genre={genre} status={status} sort={sort} />
      </div>
      <Footer />
    </div>
  );
}
