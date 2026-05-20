import fs from "fs";
import path from "path";
import { generateId } from "@/utils/generateId";
import { getHot, getNominated, getRandomStory, getRankingStories, getVipStories } from "@/utils/handleStories";
import type { User } from "@/types/user";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";


const DATA_DIR = path.join(process.cwd(), "src/lib/data");
const UPLOAD_DIR = path.join(process.cwd(), "upload");

function readJson<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
}

function writeJson<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export const db = {
  users: {
    findById(id: string): User | undefined {
      return readJson<User>("users.json").find((u) => u.id === id);
    },

    findByEmail(email: string): User | undefined {
      return readJson<User>("users.json").find((u) => u.email === email);
    },

    create(data: Omit<User, "id">): User {
      const users = readJson<User>("users.json");
      const user: User = { id: generateId(), ...data };
      writeJson("users.json", [...users, user]);
      return user;
    },
  },

  stories: {
    getAll(): Story[] {
      return readJson<Story>("stories.json");
    },

    findById(id: string): Story | undefined {
      return readJson<Story>("stories.json").find((s) => s.id === id);
    },

    findBySlug(slug: string): Story | undefined {
      return readJson<Story>("stories.json").find((s) => s.slug === slug);
    },

    // Lấy ra 5 truyện hot nhất
    getHot(limit = 5): Story[] {
      return getHot(readJson<Story>("stories.json"), limit);
    },

    // Lấy ra 5 truyện đề cử theo lịch sử đọc
    getNominated(history: string[], limit = 5): Story[] {
      return getNominated(readJson<Story>("stories.json"), history, limit);
    },
    
    // Lấy ra random truyện
    getRandom() : Story {
      return getRandomStory(readJson<Story>("stories.json"));
    },

    // Lấy ra ranking truyện
    getRanking() : Story[] {
      return getRankingStories(readJson<Story>("stories.json"));
    },

    // Lấy ra truyện vip
    getVip() : Story[] {
      return getVipStories(readJson<Story>("stories.json"));
    },
  },

  chapters: {
    // Danh sách chapter (metadata) của một truyện
    getIndex(slug: string): Chapter[] {
      const indexPath = path.join(DATA_DIR, "chapters", slug, "index.json");
      return JSON.parse(fs.readFileSync(indexPath, "utf-8")) as Chapter[];
    },

    // Nội dung chapter — đọc thẳng từ upload/
    getContent(storyId: string, storySlug: string, filename: string): string {
      const filePath = path.join(UPLOAD_DIR, `${storyId}_${storySlug}`, filename);
      return fs.readFileSync(filePath, "utf-8");
    },
  },
};
