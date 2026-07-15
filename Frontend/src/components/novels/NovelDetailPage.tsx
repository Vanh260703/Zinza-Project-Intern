import Footer from "@/components/layout/Footer";
import NovelHero from "@/components/novels/NovelHero";
import NovelTabs from "@/components/novels/NovelTabs";
import type { Novel } from "@/types/novel";
import type { Chapter } from "@/types/chapter";
import type { Review } from "@/types/review";

type Props = {
  novel: Novel;
  chapters: Chapter[];
  slug: string;
  reviews: Review[];
  posterName: string;
};

export default function NovelDetailPage({ novel, chapters, slug, reviews, posterName }: Props) {
  return (
    <div className="min-h-screen bg-stone-950">
      <NovelHero novel={novel} firstChapter={chapters[0]} posterName={posterName} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <NovelTabs novel={novel} chapters={chapters} slug={slug} reviews={reviews} />
      </div>
      <Footer />
    </div>
  );
}
