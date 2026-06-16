import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Chapter } from "@/types/chapter";

type ChapterListProps = {
  slug: string;
  chapters: Chapter[];
};

export default function ChapterList({ slug, chapters }: ChapterListProps) {
  return (
    <section>
      <h2 className="text-white font-bold text-lg mb-4">
        Danh sách chương
        <span className="ml-2 text-stone-500 text-sm font-normal">({chapters.length})</span>
      </h2>

      {chapters.length === 0 ? (
        <div className="text-center py-16 text-stone-600">
          <BookOpen className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm">Chưa có chương nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/novels/${slug}/chapters/${ch.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-colors group"
            >
              <span className="text-stone-600 text-xs w-8 shrink-0">{ch.number}</span>
              <span className="text-stone-300 text-sm truncate group-hover:text-white transition-colors">
                {ch.title}
              </span>
              {ch.candyPrice && ch.candyPrice > 0 && (
                <span className="ml-auto text-xs text-amber-400 shrink-0">🍬 {ch.candyPrice}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
