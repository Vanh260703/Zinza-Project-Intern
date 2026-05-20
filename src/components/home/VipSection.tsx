import Link from "next/link";
import { Crown } from "lucide-react";
import type { Story } from "@/types/story";
import StoryCard from "./StoryCard";

const VIP_LIMIT = 8;

type VipSectionProps = {
  stories: Story[];
};

export default function VipSection({ stories }: VipSectionProps) {
  const visible = stories.slice(0, VIP_LIMIT);
  const hasMore = stories.length > VIP_LIMIT;

  return (
    <section className="px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-amber-500/20 rounded-lg">
          <Crown className="w-4 h-4 text-amber-400" />
        </div>
        <h2 className="text-white text-xl font-bold">Truyện VIP</h2>
        <span className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full font-medium border border-amber-500/30">
          {stories.length} truyện
        </span>
        <div className="flex-1 h-px bg-stone-700/60 ml-2" />
        {hasMore && (
          <Link
            href="/novels/vip"
            className="shrink-0 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Xem tất cả →
          </Link>
        )}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
        <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-stone-400 text-xs leading-relaxed">
          <span className="text-amber-400 font-semibold">Truyện VIP</span> là những truyện có một số chương yêu cầu trả phí bằng{" "}
          <span className="text-amber-400">🍬 kẹo</span> để mở khóa. Các chương miễn phí vẫn có thể đọc bình thường.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
        {visible.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Bottom CTA nếu có nhiều hơn 8 */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Link
            href="/novels/vip"
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 text-sm font-semibold rounded-xl transition-colors"
          >
            <Crown className="w-4 h-4" />
            Xem tất cả truyện VIP
          </Link>
        </div>
      )}
    </section>
  );
}
