"use client";

import type { Novel } from "@/types/novel";
import SectionHeader from "./SectionHeader";
import NovelCarousel from "./NovelCarousel";

type NewSectionProps = {
  novels: Novel[];
};

export default function NewSection({ novels }: NewSectionProps) {
  return (
    <section>
      <SectionHeader icon="🆕" title="Truyện mới" />
      <NovelCarousel novels={novels} autoMs={2000} />
    </section>
  );
}
