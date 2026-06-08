"use client";

import type { Story } from "@/types/story";
import SectionHeader from "./SectionHeader";
import StoryCarousel from "./StoryCarousel";

type NewSectionProps = {
  stories: Story[];
};

export default function NewSection({ stories }: NewSectionProps) {
  return (
    <section>
      <SectionHeader icon="🆕" title="Truyện mới" />
      <StoryCarousel stories={stories} autoMs={2000} />
    </section>
  );
}
