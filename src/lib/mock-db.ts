import fs from "fs";
import path from "path";
import { generateId } from "@/utils/generateId";
import type { User } from "@/types/user";
import type { Story } from "@/types/story";

const DATA_DIR = path.join(process.cwd(), "src/lib/data");

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
  },
};
