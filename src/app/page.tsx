import { db } from "@/lib/mock-db";
import HomePage from "@/components/home/HomePage";

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
    <HomePage
      allStories={allStories}
      newStories={newStories}
      hotStories={hotStories}
      randomStory={randomStory}
      vipStories={vipStories}
      rankDay={rankDay}
      rankWeek={rankWeek}
      rankMonth={rankMonth}
    />
  );
}
