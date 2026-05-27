import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import StoryHero from "@/components/stories/StoryHero";
import StoryTabs from "@/components/stories/StoryTabs";
import { db } from "@/lib/mock-db";
import type { Chapter } from "@/types/chapter";
import type { Review } from "@/types/review";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;

  const story = db.stories.findBySlug(slug);

  if (!story) notFound();

  let chapters: Chapter[] = [];
  try {
    chapters = db.chapters.getIndex(slug);
  } catch {
    // truyện chưa có chapter
  }

  const reviews = db.reviews.getByStory(story.id);

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
