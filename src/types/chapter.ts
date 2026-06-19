export interface Chapter {
  id: string;
  number: number;
  title: string;
  filename: string;
  price?: number;
  wordCount?: number;
  views?: number;
  createdAt?: string;
}
