import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/mock-db";
import CreateChapterForm from "@/components/my-novels/manage/CreateChapterForm";

type Props = { params: Promise<{ id: string }> };

export default async function CreateChapterPage({ params }: Props) {
  const { id } = await params;

  const story = db.stories.findById(id);
  if (!story) notFound();

  const chapters = db.chapters.getIndex(story.slug);
  const nextNumber = chapters.length + 1;

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
          <h2 className="text-white font-bold text-lg">Đăng chương mới</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {story.name} — Chương {nextNumber}
          </p>
        </div>
        <CreateChapterForm story={story} nextNumber={nextNumber} />
      </div>
    </div>
  );
}
