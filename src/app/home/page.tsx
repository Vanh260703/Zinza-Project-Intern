import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import RandomSection from "@/components/home/RandomSection";
import HotSection from "@/components/home/HotSection";
import NominatedSection from "@/components/home/NominatedSection";
import LeaderboardWidget from "@/components/home/LeaderboardWidget";
import { db } from "@/lib/mock-db";

export default function HomePage() {
  const hotStories = db.stories.getHot();

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        <RandomSection />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          <div className="lg:col-span-3 space-y-16">
            <HotSection stories={hotStories} />
            <NominatedSection/>
          </div>

          <div className="lg:col-span-1 sticky top-24">
            <LeaderboardWidget />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
