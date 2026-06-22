import { db } from "@/lib/mock-db";
import HeroSection from "@/components/home/HeroSection";
import RandomSection from "@/components/home/RandomSection";
import NominatedSection from "@/components/home/NominatedSection";
import HotSection from "@/components/home/HotSection";
import NewSection from "@/components/home/NewSection";
import VipSection from "@/components/home/VipSection";
import RankingSection from "@/components/home/RankingSection";
import CurrentlyReadingSection from "@/components/home/CurrentlyReadingSection";
import Footer from "@/components/layout/Footer";

export default async function Page() {
  const allStories = db.stories.getAll();
  const newStories = db.stories.getNew();
  const hotStories = db.stories.getHot();
  const randomStory = db.stories.getRandom();
  const vipStories = db.stories.getVip();
  const rankDay = db.stories.getRanking("day");
  const rankWeek = db.stories.getRanking("week");
  const rankMonth = db.stories.getRanking("month");

  return (
    <div className="min-h-screen bg-stone-950">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {randomStory && <RandomSection story={randomStory} />}

        <div className="mt-12 sm:mt-16 flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-16">
            <NominatedSection allStories={allStories} />
            <NewSection stories={newStories} />
            <HotSection stories={hotStories} />
            <VipSection stories={vipStories} />
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6">
            <RankingSection day={rankDay} week={rankWeek} month={rankMonth} />
            <CurrentlyReadingSection />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
