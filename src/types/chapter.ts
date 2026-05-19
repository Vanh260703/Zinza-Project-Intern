export interface Chapter {
  id: string;
  number: number;
  title: string;
  filename: string;
  candyPrice?: number;
}

export interface ChapterFull extends Chapter {
  content: string;
  storyId: string;
}
