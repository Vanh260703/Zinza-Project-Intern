"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Star, BookMarked, Shuffle, Play } from "lucide-react";
import type { Story } from "@/types/story";
import SectionHeader from "./SectionHeader";

type RandomSectionProps = {
  story: Story;
};

function CoverImage({ storyId, hasPoster, name }: { storyId: string; hasPoster: boolean; name: string }) {
  if (!hasPoster) {
    return (
      <div className="w-full h-full bg-linear-to-br from-stone-700 to-stone-800 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-stone-600" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={`/api/cover/${storyId}`}
      alt={name}
      className="w-full h-full object-cover"
    />
  );
}

export default function RandomSection({ story }: RandomSectionProps) {
  const router = useRouter();
  const { id, slug, name, poster, author, genres, rating, ratingCount, chapterCount, status, vip, nominations, description } = story;

  return (
    <section>
      <SectionHeader
        icon="🎲"
        title="Khám phá ngẫu nhiên"
        badge="Chất lượng ≥ 4.5⭐"
        iconBg="bg-violet-500/20"
      />

      <div className="flex gap-5 sm:gap-7 p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700/80 transition-colors">
        {/* Cover */}
        <Link
          href={`/truyen/${slug}`}
          className="relative shrink-0 w-28 sm:w-36 rounded-xl overflow-hidden bg-stone-800 group"
          style={{ aspectRatio: "3/4" }}
        >
          <CoverImage storyId={id} hasPoster={!!poster} name={name} />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>

          {/* VIP badge */}
          {vip && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-md leading-none">
              VIP
            </span>
          )}

          {/* Status badge */}
          <span
            className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none ${
              status === "completed"
                ? "bg-emerald-500/90 text-white"
                : "bg-stone-700/90 text-stone-300"
            }`}
          >
            {status === "completed" ? "Hoàn thành" : "Đang ra"}
          </span>
        </Link>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div className="space-y-2.5">
            {/* Title */}
            <Link href={`/truyen/${slug}`}>
              <h3 className="text-white text-lg sm:text-xl font-bold leading-snug line-clamp-2 hover:text-amber-400 transition-colors">
                {name}
              </h3>
            </Link>

            {/* Author */}
            {author && (
              <p className="text-stone-400 text-sm">{author}</p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-3 flex-wrap">
              {rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  {ratingCount > 0 && (
                    <span className="text-stone-500 text-xs">({ratingCount})</span>
                  )}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-stone-400">
                <BookMarked className="w-3.5 h-3.5" />
                {chapterCount} chương
              </span>
              {nominations > 0 && (
                <span className="flex items-center gap-1 text-sm text-violet-400">
                  <Star className="w-3.5 h-3.5 fill-violet-400" />
                  {nominations} đề cử
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {genres.slice(0, 4).map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2 py-0.5 bg-stone-800 text-stone-400 rounded-full border border-stone-700/60 hover:border-stone-600 hover:text-stone-300 transition-colors cursor-default"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <Link
              href={`/truyen/${slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Đọc ngay
            </Link>
            <button
              onClick={() => router.refresh()}
              className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-sm font-medium rounded-lg border border-stone-700 hover:border-stone-600 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Truyện khác
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
