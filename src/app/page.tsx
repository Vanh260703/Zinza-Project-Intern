import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import RandomSection from "@/components/home/RandomSection";
import NewSection from "@/components/home/NewSection";
import HotSection from "@/components/home/HotSection";
import NominatedSection from "@/components/home/NominatedSection";
import VipSection from "@/components/home/VipSection";
import { db } from "@/lib/mock-db";

export default async function HomePage() {
  const allStories = db.stories.getAll();
  const newStories = db.stories.getNew();
  const hotStories = db.stories.getHot();
  const randomStory = db.stories.getRandom();
  const vipStories = db.stories.getVip();

  return (
    <div className="min-h-screen bg-stone-950">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        <RandomSection story={randomStory} />

        <div className="space-y-16">
          <NominatedSection allStories={allStories} />
          <NewSection stories={newStories} />
          <HotSection stories={hotStories} />
          <VipSection stories={vipStories} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
