export interface Review {
  id: string;
  storyId: string;
  userName: string;
  stars: number;
  text: string;
  daysAgo: number;
}
