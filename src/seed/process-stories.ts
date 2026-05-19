import fs from "fs";
import path from "path";
import type { Story } from "@/types/story";
import type { Status } from "@/enums/story";
import { parseOverview } from "@/utils/parseOverview";
import type { ParsedOverview } from "@/utils/parseOverview";

const UPLOAD_DIR = path.join(process.cwd(), "upload");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function findCover(folderPath: string): string | null {
  const files = fs.readdirSync(folderPath);
  const cover = files.find((f) =>
    IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
  );
  return cover ?? null;
}

function readOverview(folderPath: string): ParsedOverview | null {
  const overviewPath = path.join(folderPath, "00000_overview.txt");
  if (!fs.existsSync(overviewPath)) return null;
  return parseOverview(fs.readFileSync(overviewPath, "utf-8").trim());
}

function toStatus(raw: string): Status {
  return raw.trim() === "Hoàn thành" ? "completed" : "pending";
}

export function scanStories(): Story[] {
  return fs
    .readdirSync(UPLOAD_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((folder) => {
      const [id, ...slugParts] = folder.name.split("_");
      const folderPath = path.join(UPLOAD_DIR, folder.name);
      const files = fs.readdirSync(folderPath);
      const slug = slugParts.join("_");
      const overview = readOverview(folderPath);

      return {
        id,
        slug,
        name:         overview?.name        || slug.replace(/-/g, " "),
        poster:       findCover(folderPath),
        status:       toStatus(overview?.status ?? ""),
        chapterCount: files.filter((f) => f.endsWith(".txt") && !f.startsWith("00000")).length,
        rating:       overview?.rating       ?? 0,
        ratingCount:  overview?.ratingCount  ?? 0,
        commentCount: overview?.commentCount ?? 0,
        nominations:  overview?.nominations  ?? 0,
        author:       overview?.author       ?? "",
        postedBy:     overview?.postedBy     ?? "",
        genres:       overview?.genres       ?? [],
        tags:         overview?.tags         ?? [],
        description:  overview?.description  ?? "",
        vip:          false,
        price:        0,
        followers:    0,
      };
    });
}
