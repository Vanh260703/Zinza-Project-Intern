import fs from "fs";
import path from "path";
import { generateId } from "@/utils/generateId";
import { removeDiacritics } from "@/utils/removeDiacritics";
import {
  getNew,
  getHot,
  getNominated,
  getRandomStory,
  getRankingStories,
  getVipStories,
  type RankingPeriod,
} from "@/utils/handleStories";
import type { User } from "@/types/user";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";
import type { Notification } from "@/types/notification";
import { GENRE_BY_NAME } from "@/config/genres";

// ─── Internal mock DB types ───────────────────────────────────────────────────
// Phản ánh cấu trúc thực của JSON file — KHÔNG export ra ngoài.

type DbUser = User & {
  candy: number;
  isRead: string[];
  storiesMark: string[];
  unlockedChapters: string[];
};

// genres trong JSON lưu dạng string[] (tên thể loại).
// Khi trả về FE, transform thành Genre[].
type DbStory = Omit<Story, "genres"> & { genres: string[] };

function toStory(db: DbStory): Story {
  return {
    ...db,
    genres: db.genres.map(
      (name) =>
        GENRE_BY_NAME[name] ?? { id: name, name, slug: removeDiacritics(name).replace(/\s+/g, "-") }
    ),
  };
}

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
    getAll(): DbUser[] {
      return readJson<DbUser>("users.json");
    },

    findById(id: string): DbUser | undefined {
      return readJson<DbUser>("users.json").find((u) => u.id === id);
    },

    findByEmail(email: string): DbUser | undefined {
      return readJson<DbUser>("users.json").find((u) => u.email === email);
    },

    create(data: Omit<DbUser, "id">): DbUser {
      const users = readJson<DbUser>("users.json");
      const user: DbUser = { id: generateId(), ...data };
      writeJson("users.json", [...users, user]);
      return user;
    },

    update(id: string, patch: Partial<Omit<DbUser, "id">>): DbUser | null {
      const users = readJson<DbUser>("users.json");
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...patch };
      writeJson("users.json", users);
      return users[idx];
    },

    unlockChapter(
      userId: string,
      chapterId: string,
      price: number
    ): { user: DbUser } | { error: string } {
      const users = readJson<DbUser>("users.json");
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1) return { error: "Không tìm thấy người dùng" };

      const user = users[idx];
      if ((user.unlockedChapters ?? []).includes(chapterId)) return { user };
      if (user.candy < price) return { error: "Không đủ kẹo" };

      users[idx] = {
        ...user,
        candy: user.candy - price,
        unlockedChapters: [...(user.unlockedChapters ?? []), chapterId],
      };
      writeJson("users.json", users);
      return { user: users[idx] };
    },
  },

  stories: {
    getAll(): Story[] {
      return readJson<DbStory>("stories.json").map(toStory);
    },

    findById(id: string): Story | undefined {
      const s = readJson<DbStory>("stories.json").find((s) => s.id === id);
      return s ? toStory(s) : undefined;
    },

    findBySlug(slug: string): Story | undefined {
      const s = readJson<DbStory>("stories.json").find((s) => s.slug === slug);
      return s ? toStory(s) : undefined;
    },

    getNew(limit = 5): Story[] {
      return getNew(readJson<DbStory>("stories.json").map(toStory), limit);
    },

    getHot(limit = 5): Story[] {
      return getHot(readJson<DbStory>("stories.json").map(toStory), limit);
    },

    getNominated(history: string[], limit = 5): Story[] {
      return getNominated(readJson<DbStory>("stories.json").map(toStory), history, limit);
    },

    getRandom(): Story {
      return getRandomStory(readJson<DbStory>("stories.json").map(toStory));
    },

    getRanking(period: RankingPeriod = "month"): Story[] {
      return getRankingStories(readJson<DbStory>("stories.json").map(toStory), period);
    },

    getVip(): Story[] {
      return getVipStories(readJson<DbStory>("stories.json").map(toStory));
    },

    // patch.genres nhận string[] (tên thể loại) từ form — lưu thẳng vào JSON
    update(id: string, patch: Partial<Omit<DbStory, "id">>): Story | null {
      const stories = readJson<DbStory>("stories.json");
      const idx = stories.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      stories[idx] = { ...stories[idx], ...patch };
      writeJson("stories.json", stories);
      return toStory(stories[idx]);
    },

    getByUser(userId: string): Story[] {
      return readJson<DbStory>("stories.json")
        .filter((s) => s.postedBy === userId)
        .map(toStory);
    },

    create(data: {
      userId: string;
      name: string;
      author: string;
      status: Story["status"];
      genres: string[];
      description?: string;
    }): Story {
      const stories = readJson<DbStory>("stories.json");
      const baseSlug = removeDiacritics(data.name)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slug = stories.some((s) => s.slug === baseSlug)
        ? `${baseSlug}-${Date.now()}`
        : baseSlug;
      const story: DbStory = {
        id: generateId(),
        slug,
        name: data.name,
        author: data.author,
        poster: null,
        status: data.status,
        genres: data.genres, // lưu string[] vào JSON
        tags: [],
        description: data.description ?? "",
        vip: false,
        price: 0,
        chapterCount: 0,
        rating: 0,
        ratingCount: 0,
        commentCount: 0,
        nominations: 0,
        postedBy: data.userId,
        updatedAt: new Date(),
      };
      writeJson("stories.json", [...stories, story]);
      return toStory(story);
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
      writeJson(
        "notifications.json",
        all.map((n) => (n.userId === userId ? { ...n, isRead: true } : n))
      );
    },
  },

  reviews: {
    getByStory(storyId: string) {
      return readJson<{
        id: string;
        storyId: string;
        userName: string;
        stars: number;
        text: string;
        daysAgo: number;
      }>("reviews.json").filter((r) => r.storyId === storyId);
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

    // Đồng bộ vip = true nếu có ít nhất 1 chapter trả phí, ngược lại false
    syncVip(story: Story, chapters: Chapter[]): void {
      const hasVip = chapters.some((c) => (c.candyPrice ?? 0) > 0);
      const stories = readJson<DbStory>("stories.json");
      const idx = stories.findIndex((s) => s.id === story.id);
      if (idx !== -1 && stories[idx].vip !== hasVip) {
        stories[idx].vip = hasVip;
        writeJson("stories.json", stories);
      }
    },

    create(story: Story, data: { title: string; content: string; candyPrice?: number }): Chapter {
      const indexPath = path.join(DATA_DIR, "chapters", story.slug, "index.json");
      const dir = path.join(DATA_DIR, "chapters", story.slug);
      fs.mkdirSync(dir, { recursive: true });

      const existing: Chapter[] = fs.existsSync(indexPath)
        ? JSON.parse(fs.readFileSync(indexPath, "utf-8"))
        : [];

      const number = existing.length + 1;
      const id = generateId();
      const filename = `${String(number).padStart(5, "0")}_${Date.now()}.txt`;

      // Lưu nội dung vào upload/
      const uploadDir = path.join(UPLOAD_DIR, `${story.id}_${story.slug}`);
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), data.content, "utf-8");

      const wordCount = data.content.replace(/\s/g, "").length;
      const createdAt = new Date().toISOString();
      const chapter: Chapter = {
        id,
        number,
        title: data.title,
        filename,
        wordCount,
        views: 0,
        createdAt,
        ...(data.candyPrice ? { candyPrice: data.candyPrice } : {}),
      };
      const updated = [...existing, chapter];
      writeJson(`chapters/${story.slug}/index.json`, updated);

      // Cập nhật chapterCount + vip trong stories.json
      const stories = readJson<DbStory>("stories.json");
      const idx = stories.findIndex((s) => s.id === story.id);
      if (idx !== -1) {
        stories[idx].chapterCount = number;
        stories[idx].vip = updated.some((c) => (c.candyPrice ?? 0) > 0);
        writeJson("stories.json", stories);
      }

      return chapter;
    },

    update(
      story: Story,
      chapterId: string,
      data: { title?: string; content?: string; candyPrice?: number }
    ): Chapter | null {
      const indexPath = path.join(DATA_DIR, "chapters", story.slug, "index.json");
      if (!fs.existsSync(indexPath)) return null;
      const existing: Chapter[] = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      const idx = existing.findIndex((c) => c.id === chapterId);
      if (idx === -1) return null;

      const chapter = { ...existing[idx] };

      if (data.content !== undefined) {
        const uploadPath = path.join(UPLOAD_DIR, `${story.id}_${story.slug}`, chapter.filename);
        fs.writeFileSync(uploadPath, data.content, "utf-8");
        chapter.wordCount = data.content.replace(/\s/g, "").length;
      }
      if (data.title !== undefined) chapter.title = data.title;
      if (data.candyPrice !== undefined) {
        if (data.candyPrice === 0) delete chapter.candyPrice;
        else chapter.candyPrice = data.candyPrice;
      }

      existing[idx] = chapter;
      fs.writeFileSync(indexPath, JSON.stringify(existing, null, 2), "utf-8");
      db.chapters.syncVip(story, existing);
      return chapter;
    },

    delete(story: Story, chapterId: string): boolean {
      const indexPath = path.join(DATA_DIR, "chapters", story.slug, "index.json");
      if (!fs.existsSync(indexPath)) return false;
      const existing: Chapter[] = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      const chapter = existing.find((c) => c.id === chapterId);
      if (!chapter) return false;

      // Xóa file nội dung
      const uploadPath = path.join(UPLOAD_DIR, `${story.id}_${story.slug}`, chapter.filename);
      if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);

      // Cập nhật index
      const updated = existing.filter((c) => c.id !== chapterId);
      fs.writeFileSync(indexPath, JSON.stringify(updated, null, 2), "utf-8");

      // Cập nhật chapterCount + vip
      const stories = readJson<Story>("stories.json");
      const idx = stories.findIndex((s) => s.id === story.id);
      if (idx !== -1) {
        stories[idx].chapterCount = updated.length;
        stories[idx].vip = updated.some((c) => (c.candyPrice ?? 0) > 0);
        writeJson("stories.json", stories);
      }

      return true;
    },
  },
};
