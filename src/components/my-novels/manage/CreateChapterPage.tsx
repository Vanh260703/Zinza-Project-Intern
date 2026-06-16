import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateChapterForm from "@/components/my-novels/manage/CreateChapterForm";
import type { Story } from "@/types/story";

type Props = { story: Story; nextNumber: number };

export default function CreateChapterPage({ story, nextNumber }: Props) {
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
