"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";
import type { Review } from "@/types/review";

type Tab = "review" | "chapters" | "rating" | "comments";

type StoryTabsProps = {
  story: Story;
  chapters: Chapter[];
  slug: string;
  reviews: Review[];
};

const RATING_LABELS = ["", "Tệ", "Không hay", "Bình thường", "Hay", "Tuyệt vời"];
const PAGE_SIZE = 30;


function TabBar({
  active,
  onChange,
  chapterCount,
  commentCount,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  chapterCount: number;
  commentCount: number;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "review", label: "Review truyện" },
    { id: "chapters", label: `Danh sách chương (${chapterCount.toLocaleString()})` },
    { id: "rating", label: "Đánh giá" },
    { id: "comments", label: `Bình luận (${commentCount.toLocaleString()})` },
  ];

  return (
    <div className="border-b border-stone-800 flex gap-1 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === tab.id
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-stone-500 hover:text-stone-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function formatDaysAgo(days: number): string {
  if (days < 1) return "Hôm nay";
  if (days === 1) return "1 ngày trước";
  if (days < 30) return `${days} ngày trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

function ReviewTab({ description, reviews }: { description: string; reviews: Review[] }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Description */}
      <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
        <h3 className="text-white font-bold text-base mb-3">Giới thiệu</h3>
        <p className="text-stone-400 text-sm leading-relaxed whitespace-pre-line">{description || "Chưa có giới thiệu."}</p>
      </div>

      {/* Reader reviews */}
      <div>
        <h3 className="text-white font-bold text-base mb-4">
          Đánh giá của độc giả
          <span className="ml-2 text-stone-500 text-sm font-normal">({reviews.length})</span>
        </h3>
        {reviews.length === 0 ? (
          <p className="text-stone-600 text-sm text-center py-8">Chưa có đánh giá nào</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-stone-900 rounded-xl p-4 border border-stone-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-xs text-stone-300 font-semibold">
                    {review.userName[0]}
                  </div>
                  <span className="text-stone-300 text-sm font-medium">{review.userName}</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= review.stars ? "text-amber-400 fill-amber-400" : "text-stone-600"}`} />
                    ))}
                  </div>
                  <span className="ml-auto text-stone-600 text-xs">{formatDaysAgo(review.daysAgo)}</span>
                </div>
                <p className="text-stone-400 text-sm">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChaptersTab({ slug, chapters }: { slug: string; chapters: Chapter[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = query.trim()
    ? chapters.filter(
        (ch) =>
          ch.title.toLowerCase().includes(query.toLowerCase()) ||
          String(ch.number).includes(query.trim())
      )
    : chapters;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(0, totalPages - 1));
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const handleSearch = (v: string) => {
    setQuery(v);
    setPage(0);
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-16 text-stone-600">
        <BookOpen className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm">Chưa có chương nào</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Tìm chương..."
        className="w-full sm:w-72 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-stone-600"
      />

      {/* List */}
      {visible.length === 0 ? (
        <p className="text-stone-600 text-sm py-8 text-center">Không tìm thấy chương nào</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {visible.map((ch) => (
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

      {/* Prev / Next */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Trước
          </button>
          <span className="text-stone-600 text-xs">
            {current + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={current === totalPages - 1}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}


function RatingTab({ rating, ratingCount }: { rating: number; ratingCount: number }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const display = hovered || selected;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Overall score */}
      <div className="flex items-center gap-6 bg-stone-900 rounded-2xl p-5 border border-stone-800">
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl font-black text-amber-400">{rating.toFixed(1)}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-stone-700"}`}
              />
            ))}
          </div>
          <span className="text-stone-500 text-xs">{ratingCount.toLocaleString()} lượt</span>
        </div>

        {/* Bar chart */}
        <div className="flex-1 flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-stone-500 text-xs w-2">{s}</span>
              <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${s === Math.round(rating) ? 60 : s === Math.round(rating) - 1 ? 25 : s > Math.round(rating) ? 10 : 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write review */}
      <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 flex flex-col gap-4">
        <h3 className="text-white font-bold text-sm">Viết đánh giá của bạn</h3>

        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            </div>
            <p className="text-stone-300 text-sm font-medium">Cảm ơn bạn đã đánh giá!</p>
            <button
              onClick={() => { setSubmitted(false); setSelected(0); setText(""); }}
              className="text-stone-500 text-xs hover:text-stone-300 transition-colors"
            >
              Đánh giá lại
            </button>
          </div>
        ) : (
          <>
            {/* Star selector */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setSelected(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        s <= display
                          ? "text-amber-400 fill-amber-400"
                          : "text-stone-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className={`text-sm font-medium transition-colors ${display ? "text-amber-400" : "text-stone-600"}`}>
                {display ? RATING_LABELS[display] : "Chọn số sao"}
              </span>
            </div>

            {/* Text */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về truyện này..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-600 text-sm resize-none focus:outline-none focus:border-stone-600"
            />

            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="self-end px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              Gửi đánh giá
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CommentsTab({ commentCount }: { commentCount: number }) {
  return (
    <div className="text-center py-16 text-stone-600">
      <p className="text-sm">{commentCount > 0 ? `${commentCount.toLocaleString()} bình luận` : "Chưa có bình luận nào"}</p>
    </div>
  );
}

export default function StoryTabs({ story, chapters, slug, reviews }: StoryTabsProps) {
  const [active, setActive] = useState<Tab>("review");

  return (
    <div className="flex flex-col gap-5">
      <TabBar
        active={active}
        onChange={setActive}
        chapterCount={story.chapterCount}
        commentCount={story.commentCount}
      />

      <div>
        {active === "review" && <ReviewTab description={story.description} reviews={reviews} />}
        {active === "chapters" && <ChaptersTab slug={slug} chapters={chapters} />}
        {active === "rating" && <RatingTab rating={story.rating} ratingCount={story.ratingCount} />}
        {active === "comments" && <CommentsTab commentCount={story.commentCount} />}
      </div>
    </div>
  );
}
