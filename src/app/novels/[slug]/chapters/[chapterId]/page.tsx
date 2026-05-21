import { notFound } from "next/navigation";
import { db } from "@/lib/mock-db";
import ChapterReader from "@/components/reader/ChapterReader";

type Props = { params: Promise<{ slug: string; chapterId: string }> };

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterId } = await params;

  const story = db.stories.findBySlug(slug);
  if (!story) notFound();

  const result = db.chapters.getReader(story, chapterId);
  if (!result) notFound();

  const allChapters = db.chapters.getIndex(slug);
  const poster = db.users.findById(story.postedBy);

  return (
    <ChapterReader
      story={story}
      chapter={result.chapter}
      content={result.content}
      prev={result.prev}
      next={result.next}
      allChapters={allChapters}
      posterName={poster?.name ?? story.postedBy}
    />
  );
}
