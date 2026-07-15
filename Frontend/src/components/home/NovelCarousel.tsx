"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Novel } from "@/types/novel";
import NovelCard from "./NovelCard";

type NovelCarouselProps = {
  novels: Novel[];
  autoMs?: number;
};

const TRANSITION_MS = 500;

// Số card hiển thị theo breakpoint
// Mobile dùng 2 vì 1 card full-width trông quá to
type CarouselConfig = {
  visible: number;
  maxWidth?: string; // giới hạn container width trên mobile để card không quá to
};

function getConfig(): CarouselConfig {
  if (typeof window === "undefined") return { visible: 4 };
  const w = window.innerWidth;
  if (w >= 1024) return { visible: 4 }; // desktop: 4 cards full
  if (w >= 768) return { visible: 3 }; // tablet rộng: 3 cards
  if (w >= 640) return { visible: 2 }; // tablet hẹp: 2 cards
  return { visible: 2, maxWidth: "320px" }; // mobile: 2 cards, constrain ~160px/card
}

function useCarouselConfig() {
  const [config, setConfig] = useState<CarouselConfig | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(getConfig());
    const update = () => setConfig(getConfig());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return config;
}

export default function NovelCarousel({ novels, autoMs = 2000 }: NovelCarouselProps) {
  const n = novels.length;
  const items = [...novels, ...novels, ...novels];
  const config = useCarouselConfig();

  const [idx, setIdx] = useState(n);
  const [jumping, setJumping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animatingRef = useRef(false);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const start = useCallback(() => {
    stop();
    timerRef.current = setInterval(() => {
      if (!animatingRef.current) {
        animatingRef.current = true;
        setIdx((i) => i + 1);
      }
    }, autoMs);
  }, [autoMs, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  // Reset khi breakpoint thay đổi — dùng useLayoutEffect để reset đồng bộ
  // trước khi browser paint, tránh flash 1 frame sai position khi resize
  useLayoutEffect(() => {
    animatingRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJumping(true);
    setIdx(n);
  }, [config, n]);

  const onTransitionEnd = useCallback(() => {
    animatingRef.current = false;
    if (idx >= n * 2) {
      setJumping(true);
      setIdx(idx - n);
    } else if (idx < n) {
      setJumping(true);
      setIdx(idx + n);
    }
  }, [idx, n]);

  useEffect(() => {
    if (!jumping) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setJumping(false)));
    return () => cancelAnimationFrame(id);
  }, [jumping]);

  const goNext = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    stop();
    setIdx((i) => i + 1);
    start();
  };

  const goPrev = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    stop();
    setIdx((i) => i - 1);
    start();
  };

  // Chưa mount → hiển thị skeleton để tránh flash từ SSR → client
  if (config === null) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-3/4 rounded-xl bg-stone-800/60 animate-pulse" />
        ))}
      </div>
    );
  }

  const { visible, maxWidth } = config;
  const itemWidthPct = 100 / visible;
  const translateX = -(idx * itemWidthPct);

  return (
    <div
      className={maxWidth ? "relative mx-auto" : "relative"}
      style={maxWidth ? { maxWidth } : undefined}
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      {/* Track */}
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: jumping ? "none" : `transform ${TRANSITION_MS}ms ease-in-out`,
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {items.map((novel, i) => (
            <div
              key={`${novel.id}-${i}`}
              style={{ width: `${itemWidthPct}%` }}
              className="shrink-0 px-2"
            >
              <NovelCard novel={novel} />
            </div>
          ))}
        </div>
      </div>

      {/* Nav buttons — ẩn trên mobile (tránh bị cắt bởi viewport), chỉ hiện từ sm+ */}
      <button
        onClick={goPrev}
        aria-label="Trước"
        className="hidden sm:flex absolute left-0 top-[35%] -translate-y-1/2 -translate-x-1/2
          w-9 h-9 items-center justify-center
          bg-stone-800 hover:bg-amber-500 border border-stone-700 hover:border-amber-500
          rounded-full text-stone-300 hover:text-white transition-all shadow-lg z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={goNext}
        aria-label="Tiếp"
        className="hidden sm:flex absolute right-0 top-[35%] -translate-y-1/2 translate-x-1/2
          w-9 h-9 items-center justify-center
          bg-stone-800 hover:bg-amber-500 border border-stone-700 hover:border-amber-500
          rounded-full text-stone-300 hover:text-white transition-all shadow-lg z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {novels.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              stop();
              setIdx(n + i);
              start();
            }}
            className={`h-1.5 rounded-full transition-all ${
              (idx - n + n * 10) % n === i
                ? "w-4 bg-amber-500"
                : "w-1.5 bg-stone-700 hover:bg-stone-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
