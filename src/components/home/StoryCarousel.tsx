"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Story } from "@/types/story";
import StoryCard from "./StoryCard";

type StoryCarouselProps = {
  stories: Story[];
  autoMs?: number;
};

const VISIBLE = 4;
const TRANSITION_MS = 500;

export default function StoryCarousel({ stories, autoMs = 2000 }: StoryCarouselProps) {
  const n = stories.length;
  // Triple the list: [clone-left | real | clone-right] for seamless infinite loop
  const items = [...stories, ...stories, ...stories];

  const [idx, setIdx] = useState(n); // start at the "real" copy
  const [jumping, setJumping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const start = useCallback(() => {
    stop();
    timerRef.current = setInterval(() => setIdx((i) => i + 1), autoMs);
  }, [autoMs, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  // After slide animation ends: silently jump back into the real range
  const onTransitionEnd = useCallback(() => {
    if (idx >= n * 2) {
      setJumping(true);
      setIdx(idx - n);
    } else if (idx < n) {
      setJumping(true);
      setIdx(idx + n);
    }
  }, [idx, n]);

  // Re-enable transition one frame after the silent jump
  useEffect(() => {
    if (!jumping) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setJumping(false))
    );
    return () => cancelAnimationFrame(id);
  }, [jumping]);

  const goNext = () => { stop(); setIdx((i) => i + 1); start(); };
  const goPrev = () => { stop(); setIdx((i) => i - 1); start(); };

  const translateX = -(idx / VISIBLE) * 100;

  return (
    <div className="relative" onMouseEnter={stop} onMouseLeave={start}>
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
          {items.map((story, i) => (
            <div key={`${story.id}-${i}`} className="w-1/4 shrink-0 px-2">
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <button
        onClick={goPrev}
        aria-label="Trước"
        className="absolute left-0 top-[35%] -translate-y-1/2 -translate-x-1/2
          w-9 h-9 flex items-center justify-center
          bg-stone-800 hover:bg-amber-500 border border-stone-700 hover:border-amber-500
          rounded-full text-stone-300 hover:text-white transition-all shadow-lg z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Next button */}
      <button
        onClick={goNext}
        aria-label="Tiếp"
        className="absolute right-0 top-[35%] -translate-y-1/2 translate-x-1/2
          w-9 h-9 flex items-center justify-center
          bg-stone-800 hover:bg-amber-500 border border-stone-700 hover:border-amber-500
          rounded-full text-stone-300 hover:text-white transition-all shadow-lg z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {stories.map((_, i) => (
          <button
            key={i}
            onClick={() => { stop(); setIdx(n + i); start(); }}
            className={`h-1.5 rounded-full transition-all ${
              ((idx - n + n * 10) % n) === i
                ? "w-4 bg-amber-500"
                : "w-1.5 bg-stone-700 hover:bg-stone-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
