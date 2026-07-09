import { notFound } from "next/navigation";
import ChapterReader from "@/components/reader/ChapterReader";
import { getChapterReader } from "@/lib/api/chapterReader";

type Props = { params: Promise<{ slug: string; chapterId: string }> };

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterId } = await params;

  const data = await getChapterReader(slug, chapterId);
  if (!data) notFound();

  return (
    <ChapterReader
      novel={data.novel}
      chapter={data.chapter}
      content={data.content}
      prev={data.prev}
      next={data.next}
      allChapters={data.allChapters}
      posterName={data.posterName}
    />
  );
}
