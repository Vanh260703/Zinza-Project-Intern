import fs from "fs";
import path from "path";
import { generateId } from "@/utils/generateId";
import { removeDiacritics } from "@/utils/removeDiacritics";
import { getNew, getHot, getNominated, getRandomStory, getRankingStories, getVipStories, type RankingPeriod } from "@/utils/handleStories";
import type { User } from "@/types/user";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";
import type { Notification } from "@/types/notification";


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

    update(id: string, patch: Partial<Omit<User, "id">>): User | null {
      const users = readJson<User>("users.json");
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...patch };
      writeJson("users.json", users);
      return users[idx];
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

    // Lấy ra 5 truyện mới nhất
    getNew(limit = 5) : Story[] {
      return getNew(readJson<Story>("stories.json"), limit)
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

    // Lấy ra ranking truyện theo period
    getRanking(period: RankingPeriod = "month") : Story[] {
      return getRankingStories(readJson<Story>("stories.json"), period);
    },

    // Lấy ra truyện vip
    getVip() : Story[] {
      return getVipStories(readJson<Story>("stories.json"));
    },

    update(id: string, patch: Partial<Omit<Story, "id">>): Story | null {
      const stories = readJson<Story>("stories.json");
      const idx = stories.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      stories[idx] = { ...stories[idx], ...patch };
      writeJson("stories.json", stories);
      return stories[idx];
    },

    // Truyện đã đăng bởi user
    getByUser(userId: string): Story[] {
      return readJson<Story>("stories.json").filter((s) => s.postedBy === userId);
    },

    create(data: { userId: string; name: string; author: string; status: Story["status"]; genres: string[]; description?: string }): Story {
      const stories = readJson<Story>("stories.json");
      const baseSlug = removeDiacritics(data.name).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slug = stories.some((s) => s.slug === baseSlug) ? `${baseSlug}-${Date.now()}` : baseSlug;
      const story: Story = {
        id:           generateId(),
        slug,
        name:         data.name,
        author:       data.author,
        poster:       null,
        status:       data.status,
        genres:       data.genres,
        tags:         [],
        description:  data.description ?? "",
        vip:          false,
        price:        0,
        chapterCount: 0,
        rating:       0,
        ratingCount:  0,
        commentCount: 0,
        nominations:  0,
        postedBy:     data.userId,
        updatedAt:    new Date(),
      };
      writeJson("stories.json", [...stories, story]);
      return story;
    },

    delete(id: string): boolean {                                                                                           
        const stories = readJson<Story>("stories.json");                                                                             
        const filtered = stories.filter((s) => s.id !== id); 

        if (filtered.length === stories.length) return false;                                                                        
        writeJson("stories.json", filtered);       
                                                                                   
        return true;                                                                                                                 
    },   
  },

  notifications: {
    getByUser(userId: string, limit = 4): { notifications: Notification[]; totalUnread: number } {
      const all = readJson<Notification>("notifications.json")
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const totalUnread = all.filter((n) => !n.isRead).length;
      return { notifications: all.slice(0, limit), totalUnread };
    },

    getAll(userId: string): { notifications: Notification[]; totalUnread: number } {
      const all = readJson<Notification>("notifications.json")
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const totalUnread = all.filter((n) => !n.isRead).length;
      return { notifications: all, totalUnread };
    },

    markAllRead(userId: string): void {
      const all = readJson<Notification>("notifications.json");
      writeJson("notifications.json", all.map((n) => n.userId === userId ? { ...n, isRead: true } : n));
    },
  },

  reviews: {
    getByStory(storyId: string) {
      return readJson<{ id: string; storyId: string; userName: string; stars: number; text: string; daysAgo: number }>("reviews.json")
        .filter((r) => r.storyId === storyId);
    },
  },

  chapters: {
    // Danh sách chapter (metadata) của một truyện
    getIndex(slug: string): Chapter[] {
      const indexPath = path.join(DATA_DIR, "chapters", slug, "index.json");
      if (!fs.existsSync(indexPath)) return [];
      return JSON.parse(fs.readFileSync(indexPath, "utf-8")) as Chapter[];
    },

    // Nội dung chapter — đọc thẳng từ upload/
    getContent(storyId: string, storySlug: string, filename: string): string {
      const filePath = path.join(UPLOAD_DIR, `${storyId}_${storySlug}`, filename);
      return fs.readFileSync(filePath, "utf-8");
    },

    // Tìm 1 chapter theo id
    getOne(slug: string, chapterId: string): Chapter | undefined {
      const index = db.chapters.getIndex(slug);
      return index.find((c) => c.id === chapterId);
    },

    // Dữ liệu đầy đủ cho trang đọc: chapter + nội dung + prev/next
    getReader(
      story: Story,
      chapterId: string
    ): { chapter: Chapter; content: string; prev: Chapter | null; next: Chapter | null } | null {
      const index = db.chapters.getIndex(story.slug);
      const pos = index.findIndex((c) => c.id === chapterId);
      if (pos === -1) return null;

      const chapter = index[pos];
      const content = db.chapters.getContent(story.id, story.slug, chapter.filename);

      return {
        chapter,
        content,
        prev: pos > 0 ? index[pos - 1] : null,
        next: pos < index.length - 1 ? index[pos + 1] : null,
      };
    },

    create(story: Story, data: { title: string; content: string; candyPrice?: number }): Chapter {
      const indexPath = path.join(DATA_DIR, "chapters", story.slug, "index.json");
      const dir = path.join(DATA_DIR, "chapters", story.slug);
      fs.mkdirSync(dir, { recursive: true });

      const existing: Chapter[] = fs.existsSync(indexPath)
        ? JSON.parse(fs.readFileSync(indexPath, "utf-8"))
        : [];

      const number   = existing.length + 1;
      const id       = generateId();
      const filename = `${String(number).padStart(5, "0")}_${Date.now()}.txt`;

      // Lưu nội dung vào upload/
      const uploadDir = path.join(UPLOAD_DIR, `${story.id}_${story.slug}`);
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), data.content, "utf-8");

      const chapter: Chapter = { id, number, title: data.title, filename, ...(data.candyPrice ? { candyPrice: data.candyPrice } : {}) };
      writeJson(`chapters/${story.slug}/index.json`, [...existing, chapter]);

      // Cập nhật chapterCount trong stories.json
      const stories = readJson<Story>("stories.json");
      const idx = stories.findIndex((s) => s.id === story.id);
      if (idx !== -1) { stories[idx].chapterCount = number; writeJson("stories.json", stories); }

      return chapter;
    },
  },
};
