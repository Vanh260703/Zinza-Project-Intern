"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, AlignJustify, Gift, Star,
  Settings, List, X, ArrowUpDown, Minus, Plus,
} from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import {
  useReaderStore,
  FONT_MIN, FONT_MAX,
  FONT_FAMILIES, TEXT_COLORS, LINE_HEIGHTS,
  type FontFamily, type TextColor,
} from "@/stores/readerStore";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";

type Props = {
  story:       Story;
  chapter:     Chapter;
  content:     string;
  prev:        Chapter | null;
  next:        Chapter | null;
  allChapters: Chapter[];
  posterName:  string;
};

function chapterUrl(slug: string, id: string) {
  return `/novels/${slug}/chapters/${id}`;
}

function formatDate(date?: Date | string) {
  if (!date) return null;
  return new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "numeric", month: "long", year: "numeric",
  });
}

/* ── Nav bar ────────────────────────────────────────────── */
function NavBar({
  slug, prev, next, onOpenToc,
}: {
  slug: string;
  prev: Chapter | null;
  next: Chapter | null;
  onOpenToc: () => void;
}) {
  return (
    <div className="flex items-stretch divide-x divide-stone-700 border border-stone-700 rounded-2xl overflow-hidden bg-stone-900 text-sm">
      {prev ? (
        <Link
          href={chapterUrl(slug, prev.id)}
          className="flex items-center gap-2 px-5 py-3.5 flex-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="truncate">Chương trước</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-5 py-3.5 flex-1 text-stone-700 cursor-default">
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Chương trước</span>
        </div>
      )}

      <button
        onClick={onOpenToc}
        className="flex items-center justify-center gap-2 px-6 py-3.5 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors whitespace-nowrap"
      >
        <AlignJustify className="w-4 h-4" />
        Mục lục
      </button>

      {next ? (
        <Link
          href={chapterUrl(slug, next.id)}
          className="flex items-center justify-end gap-2 px-5 py-3.5 flex-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <span className="truncate">Chương sau</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      ) : (
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 flex-1 text-stone-700 cursor-default">
          <span>Chương sau</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </div>
      )}
    </div>
  );
}

/* ── TOC modal ──────────────────────────────────────────── */
function TocModal({
  story, currentChapterId, allChapters, onClose,
}: {
  story: Story;
  currentChapterId: string;
  allChapters: Chapter[];
  onClose: () => void;
}) {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const activeRef = useRef<HTMLAnchorElement>(null);
  const sorted = order === "asc" ? allChapters : [...allChapters].reverse();

  useEffect(() => { activeRef.current?.scrollIntoView({ block: "center" }); }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">Mục lục</h2>
            <p className="text-stone-500 text-xs mt-0.5">{story.name} — {allChapters.length} chương</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {order === "asc" ? "Cũ nhất" : "Mới nhất"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {sorted.map((ch) => {
            const active = ch.id === currentChapterId;
            return (
              <Link
                key={ch.id}
                href={chapterUrl(story.slug, ch.id)}
                ref={active ? activeRef : undefined}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 text-sm border-b border-stone-800/60 last:border-0 transition-colors ${
                  active ? "bg-amber-500/10 text-amber-400" : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <span className="text-stone-600 text-xs w-8 shrink-0 tabular-nums">{ch.number}</span>
                <span className="flex-1 truncate">{ch.title}</span>
                {ch.candyPrice && ch.candyPrice > 0 && (
                  <span className="text-[11px] text-amber-400 shrink-0">🍬 {ch.candyPrice}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Settings popover ───────────────────────────────────── */
function SettingsPopover() {
  const { fontSize, lineHeight, fontFamily, textColor,
          setFontSize, setLineHeight, setFontFamily, setTextColor } = useReaderStore();

  return (
    <div className="absolute right-11 top-0 w-64 bg-stone-800 border border-stone-700 rounded-xl shadow-2xl p-4 flex flex-col gap-4">

      {/* Font size */}
      <div className="flex flex-col gap-2">
        <p className="text-stone-400 text-[11px] font-semibold tracking-wider">CỠ CHỮ</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFontSize(Math.max(FONT_MIN, fontSize - 1))}
            disabled={fontSize <= FONT_MIN}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-stone-200 text-sm font-semibold flex-1 text-center tabular-nums">{fontSize}px</span>
          <button
            onClick={() => setFontSize(Math.min(FONT_MAX, fontSize + 1))}
            disabled={fontSize >= FONT_MAX}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Line height */}
      <div className="flex flex-col gap-2">
        <p className="text-stone-400 text-[11px] font-semibold tracking-wider">GIÃN DÒNG</p>
        <div className="flex gap-1.5">
          {LINE_HEIGHTS.map((lh) => (
            <button
              key={lh}
              onClick={() => setLineHeight(lh)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                lineHeight === lh
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-stone-600 text-stone-400 hover:bg-stone-700 hover:text-white"
              }`}
            >
              {lh}
            </button>
          ))}
        </div>
      </div>

      {/* Font family */}
      <div className="flex flex-col gap-2">
        <p className="text-stone-400 text-[11px] font-semibold tracking-wider">FONT CHỮ</p>
        <div className="flex gap-1.5">
          {(Object.entries(FONT_FAMILIES) as [FontFamily, { label: string; style: string }][]).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setFontFamily(key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                fontFamily === key
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-stone-600 text-stone-400 hover:bg-stone-700 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Text color */}
      <div className="flex flex-col gap-2">
        <p className="text-stone-400 text-[11px] font-semibold tracking-wider">MÀU CHỮ</p>
        <div className="flex gap-2">
          {(Object.entries(TEXT_COLORS) as [TextColor, { label: string; hex: string }][]).map(([key, { label, hex }]) => (
            <button
              key={key}
              onClick={() => setTextColor(key)}
              title={label}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                textColor === key ? "border-amber-500 scale-110" : "border-stone-600 hover:border-stone-400"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function ChapterReader({ story, chapter, content, prev, next, allChapters, posterName }: Props) {
  const addHistory   = useLibraryStore((s) => s.addHistory);
  const { fontSize, lineHeight, fontFamily, textColor } = useReaderStore();

  const [showToc,      setShowToc]      = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { addHistory(story.id); }, [story.id, addHistory]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [chapter.id]);
  useEffect(() => {
    document.body.style.overflow = showToc ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showToc]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const articleStyle = {
    fontSize,
    lineHeight,
    fontFamily:  FONT_FAMILIES[fontFamily].style,
    color:       TEXT_COLORS[textColor].hex,
  };

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="max-w-3xl mx-auto px-5 py-10 sm:py-14">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <Link href={`/novels/${story.slug}`} className="text-stone-400 hover:text-amber-400 text-sm transition-colors">
            {story.name}
          </Link>
          <h1 className="text-amber-400 font-bold text-2xl sm:text-3xl leading-snug">{chapter.title}</h1>
          <p className="text-stone-500 text-sm flex items-center gap-2 flex-wrap justify-center">
            <span>Người đăng: <span className="text-stone-400">{posterName}</span></span>
            {story.updatedAt && (
              <>
                <span className="text-stone-700">•</span>
                <span>{formatDate(story.updatedAt)}</span>
              </>
            )}
          </p>
        </div>

        <NavBar slug={story.slug} prev={prev} next={next} onOpenToc={() => setShowToc(true)} />

        {/* Content */}
        <article className="mt-10 mb-10 flex flex-col gap-5" style={articleStyle}>
          {paragraphs.map((p, i) => (
            <p key={i} className="tracking-wide">{p}</p>
          ))}
        </article>

        <NavBar slug={story.slug} prev={prev} next={next} onOpenToc={() => setShowToc(true)} />
      </div>

      {/* Floating buttons */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
        {[
          { icon: <Gift className="w-4 h-4" />, title: "Tặng quà" },
          { icon: <Star className="w-4 h-4" />, title: "Đề cử"    },
        ].map(({ icon, title }) => (
          <button
            key={title}
            title={title}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-800 border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors shadow-lg"
          >
            {icon}
          </button>
        ))}

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            title="Cài đặt đọc"
            onClick={() => setShowSettings((v) => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors shadow-lg ${
              showSettings
                ? "bg-amber-500 border-amber-500 text-white"
                : "bg-stone-800 border-stone-700 text-stone-400 hover:text-white hover:bg-stone-700"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
          {showSettings && <SettingsPopover />}
        </div>

        {/* TOC */}
        <button
          title="Mục lục"
          onClick={() => setShowToc(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-800 border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors shadow-lg"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {showToc && (
        <TocModal
          story={story}
          currentChapterId={chapter.id}
          allChapters={allChapters}
          onClose={() => setShowToc(false)}
        />
      )}
    </div>
  );
}
