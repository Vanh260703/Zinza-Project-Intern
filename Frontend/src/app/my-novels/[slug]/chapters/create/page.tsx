import { notFound } from "next/navigation";
import { getManageNovel } from "@/lib/api/manageNovel";
import CreateChapterPage from "@/components/my-novels/manage/CreateChapterPage";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const novel = await getManageNovel(slug);
  if (!novel) notFound();
  return <CreateChapterPage novel={novel} nextNumber={novel.chapterCount + 1} />;
}
