import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star, BookMarked } from "lucide-react";
import type { Novel } from "@/types/novel";
import { getNovelStatus } from "@/config/statuses";

type NovelCardProps = {
  novel: Novel;
};

function CoverImage({ posterUrl, name }: { posterUrl: string | null; name: string }) {
  if (!posterUrl) {
    return (
      <div className="w-full h-full bg-linear-to-br from-stone-700 to-stone-800 flex items-center justify-center">
        <BookOpen className="w-10 h-10 text-stone-600" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <Image
      src={posterUrl}
      alt={name}
      width={300}
      height={400}
      className="w-full h-full object-cover"
      sizes="(max-width: 640px) 160px, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  );
}

export default function NovelCard({ novel }: NovelCardProps) {
  const { slug, name, posterUrl, author, categories, rating, chapterCount, status, vip, nominations } =
    novel;

  return (
    <Link href={`/novels/${slug}`} className="group flex flex-col">
      {/* Cover */}
      <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-3 bg-stone-800">
        <CoverImage posterUrl={posterUrl} name={name} />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* VIP badge */}
        {vip && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-md leading-none">
            VIP
          </span>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none ${
            status === "COMPLETED"
              ? "bg-emerald-500/90 text-white"
              : "bg-stone-700/90 text-stone-300"
          }`}
        >
          {getNovelStatus(status).label}
        </span>

        {/* Nominations */}
        {nominations > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-amber-400 font-medium">{nominations}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1">
        {/* Title */}
        <h3 className="text-stone-100 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
          {name}
        </h3>

        {/* Author */}
        {author && <p className="text-stone-500 text-xs truncate">{author}</p>}

        {/* Rating + chapters */}
        <div className="flex items-center gap-2 mt-0.5">
          {rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-xs text-stone-500">
            <BookMarked className="w-3 h-3" />
            {chapterCount} chương
          </span>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-0.5">
            {categories.slice(0, 2).map((g) => (
              <span
                key={g.slug}
                className="text-[10px] px-1.5 py-0.5 bg-stone-800 text-stone-400 rounded-md border border-stone-700/60"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
