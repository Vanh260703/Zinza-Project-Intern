import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getManageChapter } from "@/lib/api/manageNovel";
import EditChapterForm from "@/components/my-novels/manage/EditChapterForm";

type Props = { params: Promise<{ slug: string; chapterId: string }> };

export default async function Page({ params }: Props) {
  const { slug, chapterId } = await params;
  // 1 call: endpoint chương đã trả kèm tên truyện + người đăng
  const chapterData = await getManageChapter(slug, chapterId);
  if (!chapterData) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/my-novels/${slug}`}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại quản lý truyện
      </Link>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-white font-bold text-lg">Chỉnh sửa chương</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {chapterData.novelName} — Chương {chapterData.chapter.number}
          </p>
        </div>
        <EditChapterForm
          slug={slug}
          postedBy={chapterData.postedBy}
          chapter={chapterData.chapter}
          initialContent={chapterData.content}
        />
      </div>
    </div>
  );
}
