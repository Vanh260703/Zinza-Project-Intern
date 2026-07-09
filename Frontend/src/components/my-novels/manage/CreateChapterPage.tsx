import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateChapterForm from "@/components/my-novels/manage/CreateChapterForm";
import type { Novel } from "@/types/novel";

type Props = { novel: Novel; nextNumber: number };

export default function CreateChapterPage({ novel, nextNumber }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/my-novels/${novel.slug}`}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại quản lý truyện
      </Link>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-white font-bold text-lg">Đăng chương mới</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {novel.name} — Chương {nextNumber}
          </p>
        </div>
        <CreateChapterForm novel={novel} nextNumber={nextNumber} />
      </div>
    </div>
  );
}
