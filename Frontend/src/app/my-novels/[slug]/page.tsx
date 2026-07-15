import { notFound } from "next/navigation";
import { getManageNovel } from "@/lib/api/manageNovel";
import ManageNovelContent from "@/components/my-novels/manage/ManageNovelContent";

type Props = { params: Promise<{ slug: string }> };

export default async function ManageNovelPage({ params }: Props) {
  const { slug } = await params;
  const novel = await getManageNovel(slug);
  if (!novel) notFound();

  return <ManageNovelContent novel={novel} />;
}
