import HeroSection from "@/components/home/HeroSection";
import RandomSection from "@/components/home/RandomSection";
import NominatedSection from "@/components/home/NominatedSection";
import HotSection from "@/components/home/HotSection";
import NewSection from "@/components/home/NewSection";
import VipSection from "@/components/home/VipSection";
import RankingSection from "@/components/home/RankingSection";
import CurrentlyReadingSection from "@/components/home/CurrentlyReadingSection";
import Footer from "@/components/layout/Footer";
import { homeApi } from "@/lib/api/home";

export default async function Page() {
  const [newNovels, hotNovels, vipNovels, nominatedPool, randomNovel, rankings] =
    await Promise.all([
      homeApi.list("sort=newest&limit=12"),
      homeApi.list("sort=views&limit=12"),
      homeApi.list("vip=true&limit=12"),
      homeApi.list("sort=nominations&limit=24"),
      homeApi.random(),
      homeApi.rankings(),
    ]);

  return (
    <div className="min-h-screen bg-stone-950">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {randomNovel && <RandomSection novel={randomNovel} />}

        <div className="mt-12 sm:mt-16 flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-16">
            <NominatedSection allNovels={nominatedPool} />
            <NewSection novels={newNovels} />
            <HotSection novels={hotNovels} />
            <VipSection novels={vipNovels} />
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6">
            <RankingSection day={rankings.day} week={rankings.week} month={rankings.month} />
            <CurrentlyReadingSection />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
