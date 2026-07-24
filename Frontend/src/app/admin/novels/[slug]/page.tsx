import NovelDetailContent from "@/components/admin/novels/NovelDetailContent";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminNovelDetailPage({ params }: Props) {
  const { slug } = await params;
  return <NovelDetailContent novelSlug={slug} />;
}
