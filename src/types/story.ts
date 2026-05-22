import type { Status } from "@/enums/story";

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
  genres: string[];
  tags: string[];
  description: string;
  vip: boolean;
  price: number;
  followers?: number;
  updatedAt?: Date; 
}
