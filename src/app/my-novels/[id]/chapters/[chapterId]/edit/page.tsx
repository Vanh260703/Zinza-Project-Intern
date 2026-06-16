import { notFound } from "next/navigation";
import { db } from "@/lib/mock-db";
import EditChapterPage from "@/components/my-novels/manage/EditChapterPage";

type Props = { params: Promise<{ id: string; chapterId: string }> };

export default async function Page({ params }: Props) {
  const { id, chapterId } = await params;
  const story = db.stories.findById(id);
  if (!story) notFound();
  const reader = db.chapters.getReader(story, chapterId);
  if (!reader) notFound();
  return <EditChapterPage story={story} chapter={reader.chapter} initialContent={reader.content} />;
}
