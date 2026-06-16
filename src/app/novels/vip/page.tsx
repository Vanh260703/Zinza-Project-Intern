import { db } from "@/lib/mock-db";
import VipContent from "@/components/novels/VipContent";

const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function VipPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const stories = db.stories.getVip();

  const totalPages = Math.ceil(stories.length / PAGE_SIZE);
  const currentPage = Math.min(Math.max(1, parseInt(page ?? "1") || 1), totalPages);
  const visible = stories.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return <VipContent stories={visible} currentPage={currentPage} totalPages={totalPages} />;
}
