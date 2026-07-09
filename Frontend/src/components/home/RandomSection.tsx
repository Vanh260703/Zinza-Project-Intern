"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Star, BookMarked, Play } from "lucide-react";
import type { Novel } from "@/types/novel";
import { getNovelStatus } from "@/config/statuses";
import SectionHeader from "./SectionHeader";

type RandomSectionProps = {
  novel: Novel;
};

function CoverImage({ posterUrl, name }: { posterUrl: string | null; name: string }) {
  if (!posterUrl) {
    return (
      <div className="w-full h-full bg-linear-to-br from-stone-700 to-stone-800 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-stone-600" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <Image
      src={posterUrl}
      alt={name}
      fill
      sizes="(max-width: 640px) 128px, 144px"
      className="object-cover"
    />
  );
}

export default function RandomSection({ novel }: RandomSectionProps) {
  const router = useRouter();
  const {
    slug,
    name,
    posterUrl,
    author,
    categories,
    rating,
    ratingCount,
    chapterCount,
    status,
    vip,
    nominations,
    description,
  } = novel;

  return (
    <section>
      <SectionHeader
        icon="🎲"
        title="Khám phá ngẫu nhiên"
        badge="Chất lượng ≥ 4.5⭐"
        iconBg="bg-violet-500/20"
      />

      <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 p-4 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700/80 transition-colors">
        {/* Cover */}
        <Link
          href={`/novels/${slug}`}
          className="relative shrink-0 w-32 sm:w-36 mx-auto sm:mx-0 rounded-xl overflow-hidden bg-stone-800 group"
          style={{ aspectRatio: "3/4" }}
        >
          <CoverImage posterUrl={posterUrl} name={name} />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>

          {vip && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-md leading-none">
              VIP
            </span>
          )}

          <span
            className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none ${
              status === "COMPLETED"
                ? "bg-emerald-500/90 text-white"
                : "bg-stone-700/90 text-stone-300"
            }`}
          >
            {getNovelStatus(status).label}
          </span>
        </Link>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-2.5">
            <Link href={`/novels/${slug}`}>
              <h3 className="text-white text-lg sm:text-xl font-bold leading-snug line-clamp-2 hover:text-amber-400 transition-colors text-center sm:text-left">
                {name}
              </h3>
            </Link>

            {author && <p className="text-stone-400 text-sm text-center sm:text-left">{author}</p>}

            {/* Stats row */}
            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
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

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start">
                {categories.slice(0, 3).map((g) => (
                  <span
                    key={g.slug}
                    className="text-xs px-2 py-0.5 bg-stone-800 text-stone-400 rounded-full border border-stone-700/60"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="hidden sm:block text-stone-500 text-sm leading-relaxed">
                {description.length > 200 ? (
                  <>
                    {description.slice(0, 200).trimEnd()}…{" "}
                    <Link
                      href={`/novels/${slug}`}
                      className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                    >
                      Xem thêm
                    </Link>
                  </>
                ) : (
                  description
                )}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
            <Link
              href={`/novels/${slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Đọc ngay
            </Link>
            <button
              onClick={() => router.refresh()}
              className="dice-btn flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-sm font-medium rounded-lg border border-stone-700 hover:border-stone-600 transition-colors"
            >
              <span className="dice-icon inline-block">🎲</span>
              Truyện khác
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
