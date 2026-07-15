"use client";

import type { Novel } from "@/types/novel";
import SectionHeader from "./SectionHeader";
import NovelCarousel from "./NovelCarousel";

type HotSectionProps = {
  novels: Novel[];
};

export default function HotSection({ novels }: HotSectionProps) {
  return (
    <section>
      <SectionHeader icon="🔥" title="Truyện hot" />
      <NovelCarousel novels={novels} autoMs={2000} />
    </section>
  );
}
