import fs from "fs";
import path from "path";
import type { Chapter } from "@/types/chapter";

const UPLOAD_DIR = path.join(process.cwd(), "upload");
const CHAPTERS_DIR = path.join(process.cwd(), "src/lib/data/chapters");

function readTitle(filePath: string): string {
  const buf = Buffer.alloc(200);

  // Mở chapter
  const fd = fs.openSync(filePath, "r");

  const bytesRead = fs.readSync(fd, buf, 0, 200, 0);
  fs.closeSync(fd);

  // Lấy dòng đầu tiên của file text 
  return buf.slice(0, bytesRead).toString("utf-8").split("\n")[0].trim();
}

export function processChapters(): void {
  const storyFolders = fs
    .readdirSync(UPLOAD_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  for (const folder of storyFolders) {
    const [, ...slugParts] = folder.name.split("_");
    const slug = slugParts.join("_");
    const folderPath = path.join(UPLOAD_DIR, folder.name);

    // Lấy ra tất cả những chapter (skip banner & overview)
    const chapterFiles = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith(".txt") && !f.startsWith("00000"))
      .sort();

    // Khởi tạo chapter theo interface
    const chapters: Chapter[] = chapterFiles.map((filename) => {
      const number = parseInt(filename.split("_")[0], 10);
      const title = readTitle(path.join(folderPath, filename));
      return {
        id: String(number),
        number,
        title,
        filename,
      };
    });

    const outDir = path.join(CHAPTERS_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "index.json"),
      JSON.stringify(chapters, null, 2),
      "utf-8"
    );
  }

  console.log(`Seeded chapters for ${storyFolders.length} stories → src/lib/data/chapters/`);
}
