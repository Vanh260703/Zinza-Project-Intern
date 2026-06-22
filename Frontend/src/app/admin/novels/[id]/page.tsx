import NovelDetailContent from "@/components/admin/novels/NovelDetailContent";

type Props = { params: Promise<{ id: string }> };

export default async function AdminNovelDetailPage({ params }: Props) {
  const { id } = await params;
  return <NovelDetailContent novelId={id} />;
}
