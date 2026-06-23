import { notFound } from "next/navigation";
import { db } from "@/lib/mock-db";
import CreateChapterPage from "@/components/my-novels/manage/CreateChapterPage";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  const story = db.stories.findById(id);
  if (!story) notFound();
  const chapters = db.chapters.getIndex(story.slug);
  return <CreateChapterPage story={story} nextNumber={chapters.length + 1} />;
}
