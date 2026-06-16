import type { Status } from "@/enums/story";
import type { Genre } from "@/config/genres";

export type { Genre };

export interface Story {
  id: string;
  slug: string;
  name: string;
  poster: string | null;
  status: Status;
  chapterCount: number;
  rating: number;
  ratingCount: number;
  commentCount: number;
  nominations: number;
  author: string;
  postedBy: string;
  genres: Genre[];
  tags: string[];
  description: string;
  vip: boolean;
  price: number;
  updatedAt?: Date;
}
