import fs from "fs";
import path from "path";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const reseed = process.env.RESEED === "1";

  const novelsPath = path.join(process.cwd(), "src/lib/data/novels.json");
  const chaptersDir = path.join(process.cwd(), "src/lib/data/chapters");

  const novelsExist = fs.existsSync(novelsPath);
  const chaptersExist = fs.existsSync(chaptersDir);

  if (novelsExist && chaptersExist && !reseed) {
    console.log("Data đã tồn tại, bỏ qua seed (RESEED=1 để seed lại)");
    return;
  }

  if (!novelsExist || reseed) {
    const { scanNovels } = await import("@/seed/process-novels");
    const novels = scanNovels();
    fs.writeFileSync(novelsPath, JSON.stringify(novels, null, 2), "utf-8");
    console.log(`Seeded ${novels.length} novels → src/lib/data/novels.json`);
  }

  if (!chaptersExist || reseed) {
    const { processChapters } = await import("@/seed/process-chapters");
    processChapters();
  }
}
