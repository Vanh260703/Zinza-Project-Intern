export interface Review {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  stars: number;
  text: string;
  daysAgo: number;
}
