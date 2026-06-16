import Footer from "@/components/layout/Footer";
import StoryHero from "@/components/stories/StoryHero";
import StoryTabs from "@/components/stories/StoryTabs";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";
import type { Review } from "@/types/review";

type Props = {
  story: Story;
  chapters: Chapter[];
  slug: string;
  reviews: Review[];
};

export default function NovelDetailPage({ story, chapters, slug, reviews }: Props) {
  return (
    <div className="min-h-screen bg-stone-950">
      <StoryHero story={story} firstChapter={chapters[0]} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <StoryTabs story={story} chapters={chapters} slug={slug} reviews={reviews} />
      </div>
      <Footer />
    </div>
  );
}
