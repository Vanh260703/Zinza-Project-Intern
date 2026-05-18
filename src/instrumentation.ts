import fs from 'fs';
import path from 'path';

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { scanStories } = await import("@/seed/stories");

  const stories = scanStories();

  const outputPath = path.join(process.cwd(), "src/lib/data/stories.json");

  // Skip nếu đã có — muốn reseed thì chạy với RESEED=1
  if (fs.existsSync(outputPath) && process.env.RESEED !== "1") {
    console.log("stories.json đã tồn tại, bỏ qua seed (RESEED=1 để seed lại)");
    return;
  }

  fs.writeFileSync(outputPath, JSON.stringify(stories, null, 2), "utf-8");
  console.log(`Seeded ${stories.length} stories → src/lib/data/stories.json`);
}
