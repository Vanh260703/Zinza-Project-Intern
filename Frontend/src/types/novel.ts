import type { Status } from "@/enums/novel";
import type { Category } from "@/config/category";

export type { Category };

export interface Novel {
  id: string;
  slug: string;
  name: string;
  posterUrl: string | null;
  status: Status;
  chapterCount: number;
  rating: number;
  ratingCount: number;
  commentCount: number;
  nominations: number;
  views: number;
  candyReceived: number;
  author: string;
  postedBy: string;
  categories: Category[];
  tags: string[];
  description: string;
  vip: boolean;
  price: number;
  updatedAt?: Date;
}
