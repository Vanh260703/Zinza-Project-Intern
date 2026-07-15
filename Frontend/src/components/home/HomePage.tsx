import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import RandomSection from "@/components/home/RandomSection";
import NewSection from "@/components/home/NewSection";
import HotSection from "@/components/home/HotSection";
import NominatedSection from "@/components/home/NominatedSection";
import VipSection from "@/components/home/VipSection";
import RankingSection from "@/components/home/RankingSection";
import CurrentlyReadingSection from "@/components/home/CurrentlyReadingSection";
import type { Novel } from "@/types/novel";

type Props = {
  allNovels: Novel[];
  newNovels: Novel[];
  hotNovels: Novel[];
  randomNovel: Novel;
  vipNovels: Novel[];
  rankDay: Novel[];
  rankWeek: Novel[];
  rankMonth: Novel[];
};

export default function HomePage({
  allNovels,
  newNovels,
  hotNovels,
  randomNovel,
  vipNovels,
  rankDay,
  rankWeek,
  rankMonth,
}: Props) {
  return (
    <div className="min-h-screen bg-stone-950">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <RandomSection novel={randomNovel} />
        <div className="mt-12 sm:mt-16 flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          <div className="flex-1 min-w-0 space-y-16">
            <NominatedSection allNovels={allNovels} />
            <NewSection novels={newNovels} />
            <HotSection novels={hotNovels} />
            <VipSection novels={vipNovels} />
          </div>
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
