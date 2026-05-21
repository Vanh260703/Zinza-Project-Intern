import { notFound } from "next/navigation";
import { db } from "@/lib/mock-db";
import ManageNovelContent from "@/components/my-novels/manage/ManageNovelContent";

type Props = { params: Promise<{ id: string }> };

export default async function ManageNovelPage({ params }: Props) {
  const { id } = await params;
  const story = db.stories.findById(id);
  if (!story) notFound();

  return <ManageNovelContent story={story} />;
}
