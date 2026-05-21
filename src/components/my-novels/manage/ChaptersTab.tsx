"use client";

import { useEffect, useState } from "react";
import { BookOpen, PlusCircle, Lock, Pencil } from "lucide-react";
import type { Chapter } from "@/types/chapter";

type Props = { novelId: string };

export default function ChaptersTab({ novelId }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/novels/${novelId}/chapters`)
      .then((r) => r.json())
      .then(setChapters)
      .finally(() => setLoading(false));
  }, [novelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-stone-500 text-sm">{chapters.length} chương</p>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors">
          <PlusCircle className="w-3.5 h-3.5" />
          Thêm chương
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <BookOpen className="w-8 h-8 text-stone-700" strokeWidth={1.5} />
          <p className="text-stone-600 text-sm">Chưa có chương nào.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-stone-800">
          {chapters.map((ch) => (
            <div key={ch.id} className="flex items-center gap-3 py-3 group">
              <span className="text-stone-600 text-xs w-8 shrink-0">#{ch.number}</span>
              <p className="text-stone-300 text-sm flex-1 truncate group-hover:text-white transition-colors">
                {ch.title}
              </p>
              {ch.candyPrice ? (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  {ch.candyPrice} kẹo
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 bg-stone-800 border border-stone-700 text-stone-500 rounded-md shrink-0">
                  Miễn phí
                </span>
              )}
              <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-500 hover:text-white hover:bg-stone-800 transition-all shrink-0">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
