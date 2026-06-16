import { notFound } from "next/navigation";
import { db } from "@/lib/mock-db";
import type { Chapter } from "@/types/chapter";
import NovelDetailPage from "@/components/novels/NovelDetailPage";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const story = db.stories.findBySlug(slug);
  if (!story) notFound();

  let chapters: Chapter[] = [];
  try {
    chapters = db.chapters.getIndex(slug);
  } catch {}

  const reviews = db.reviews.getByStory(story.id);
  return <NovelDetailPage story={story} chapters={chapters} slug={slug} reviews={reviews} />;
}
