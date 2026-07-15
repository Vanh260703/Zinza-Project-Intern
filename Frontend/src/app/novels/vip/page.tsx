import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";
import VipContent from "@/components/novels/VipContent";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function VipPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1") || 1);

  // Dữ liệu công khai, không cá nhân hoá → cache với revalidate thay vì no-store.
  const res = await fetch(
    `${BE_URL}/api/v1/novels?vip=true&page=${currentPage}&limit=${PAGE_SIZE}`,
    { next: { revalidate: 60 } }
  );

  const json = (await res.json()) as { data: BeNovel[]; meta: { totalPages: number } };
  const novels = json.data.map(normalizeNovel);

  return (
    <VipContent novels={novels} currentPage={currentPage} totalPages={json.meta.totalPages} />
  );
}
