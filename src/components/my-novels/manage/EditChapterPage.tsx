import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditChapterForm from "@/components/my-novels/manage/EditChapterForm";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";

type Props = { story: Story; chapter: Chapter; initialContent: string };

export default function EditChapterPage({ story, chapter, initialContent }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/my-novels/${story.id}`}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại quản lý truyện
      </Link>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-white font-bold text-lg">Chỉnh sửa chương</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {story.name} — Chương {chapter.number}
          </p>
        </div>
        <EditChapterForm novelId={story.id} chapter={chapter} initialContent={initialContent} />
      </div>
    </div>
  );
}
