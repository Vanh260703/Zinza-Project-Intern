import type { Story } from "@/types/story";
import SectionHeader from "./SectionHeader";
import StoryCarousel from "./StoryCarousel";

type HotSectionProps = {
  stories: Story[];
};

export default function HotSection({ stories }: HotSectionProps) {
  return (
    <section className="px-4">
      <SectionHeader icon="🔥" title="Truyện hot" />
      <StoryCarousel stories={stories} autoMs={2000} />
    </section>
  );
}
