import fs from "fs";
import path from "path";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const reseed = process.env.RESEED === "1";

  const storiesPath = path.join(process.cwd(), "src/lib/data/stories.json");
  const chaptersDir = path.join(process.cwd(), "src/lib/data/chapters");

  const storiesExist = fs.existsSync(storiesPath);
  const chaptersExist = fs.existsSync(chaptersDir);

  if (storiesExist && chaptersExist && !reseed) {
    console.log("Data đã tồn tại, bỏ qua seed (RESEED=1 để seed lại)");
    return;
  }

  if (!storiesExist || reseed) {
    const { scanStories } = await import("@/seed/process-stories");
    const stories = scanStories();
    fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2), "utf-8");
    console.log(`Seeded ${stories.length} stories → src/lib/data/stories.json`);
  }

  if (!chaptersExist || reseed) {
    const { processChapters } = await import("@/seed/process-chapters");
    processChapters();
  }
}
