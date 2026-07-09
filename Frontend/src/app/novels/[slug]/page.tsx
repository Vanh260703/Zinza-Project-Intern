import { notFound } from "next/navigation";
import NovelDetailPage from "@/components/novels/NovelDetailPage";
import { getNovelDetail } from "@/lib/api/novelDetail";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const detail = await getNovelDetail(slug);
  if (!detail) notFound();

  return (
    <NovelDetailPage
      novel={detail.novel}
      chapters={detail.chapters}
      slug={slug}
      reviews={detail.reviews}
      posterName={detail.posterName}
    />
  );
}
