import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/mock-db";
import EditChapterForm from "@/components/my-novels/manage/EditChapterForm";

type Props = { params: Promise<{ id: string; chapterId: string }> };

export default async function EditChapterPage({ params }: Props) {
  const { id, chapterId } = await params;

  const story = db.stories.findById(id);
  if (!story) notFound();

  const reader = db.chapters.getReader(story, chapterId);
  if (!reader) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/my-novels/${id}`}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại quản lý truyện
      </Link>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-white font-bold text-lg">Chỉnh sửa chương</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {story.name} — Chương {reader.chapter.number}
          </p>
        </div>
        <EditChapterForm
          novelId={id}
          chapter={reader.chapter}
          initialContent={reader.content}
        />
      </div>
    </div>
  );
}
