import Link from "next/link";
import { BookOpen, Star, BookMarked } from "lucide-react";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";
import { getStoryStatus } from "@/config/statuses";
import CandyButton from "./CandyButton";
import FollowButton from "./FollowButton";
import RecommendButton from "./RecommendButton";

type StoryHeroProps = {
  story: Story;
  firstChapter?: Chapter;
};

function CoverImage({
  storyId,
  hasPoster,
  name,
}: {
  storyId: string;
  hasPoster: boolean;
  name: string;
}) {
  if (!hasPoster) {
    return (
      <div className="w-full h-full bg-linear-to-br from-stone-700 to-stone-800 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-stone-600" strokeWidth={1.5} />
      </div>
    );
  }
  return <img src={`/api/cover/${storyId}`} alt={name} className="w-full h-full object-cover" />;
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-stone-400 text-sm">
      {icon}
      <span className="text-white font-medium">{value}</span>
      {label && <span className="text-stone-500">{label}</span>}
    </div>
  );
}

export default function StoryHero({ story, firstChapter }: StoryHeroProps) {
  const {
    id,
    slug,
    name,
    poster,
    author,
    postedBy,
    genres,
    status,
    rating,
    ratingCount,
    chapterCount,
    nominations,
    vip,
  } = story;

  const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Cover */}
        <div className="shrink-0 w-40 sm:w-48 mx-auto sm:mx-0">
          <div className="aspect-square rounded-2xl overflow-hidden bg-stone-800 shadow-xl shadow-black/50">
            <CoverImage storyId={id} hasPoster={!!poster} name={name} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Status + Genres */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                status === "completed" ? "bg-emerald-500 text-white" : "bg-stone-700 text-stone-300"
              }`}
            >
              {getStoryStatus(status).label}
            </span>
            {vip && (
              <span className="text-xs font-bold px-3 py-1 bg-amber-500 text-white rounded-full">
                VIP
              </span>
            )}
            {genres.slice(0, 2).map((g) => (
              <span
                key={g.slug}
                className="text-xs font-medium px-3 py-1 bg-stone-800 border border-stone-700 text-stone-300 rounded-full"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{name}</h1>

          {/* Author + Posted by */}
          <div className="flex flex-col gap-0.5 text-sm text-stone-400">
            <span>
              Tác giả: <span className="text-stone-200">{author}</span>
            </span>
            {postedBy && (
              <span>
                Đăng bởi: <span className="text-stone-200">{postedBy}</span>
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 flex-wrap">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-stone-600"}`}
                  />
                ))}
                <span className="text-amber-400 font-semibold text-sm ml-1">
                  {rating.toFixed(3)}
                </span>
                {ratingCount > 0 && <span className="text-stone-500 text-xs">({ratingCount})</span>}
              </div>
            )}
            <StatItem
              icon={<BookMarked className="w-4 h-4" />}
              value={chapterCount.toLocaleString()}
              label="chương"
            />
            {nominations > 0 && (
              <StatItem
                icon={<span className="text-sm">🍬</span>}
                value={formatNum(nominations)}
                label="đề cử"
              />
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <Link
              href={firstChapter ? `/novels/${slug}/chapters/${firstChapter.id}` : "#"}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
            >
              <BookOpen className="w-4 h-4" />
              Đọc ngay
            </Link>
            <FollowButton storyId={id} />
            <RecommendButton storyId={id} postedBy={postedBy} />
            <CandyButton />
          </div>
        </div>
      </div>
    </div>
  );
}
