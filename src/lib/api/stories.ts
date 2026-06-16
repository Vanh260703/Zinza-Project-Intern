import type { Story } from "@/types/story";

export const storiesApi = {
  getByIds: (ids: string[]): Promise<Story[]> =>
    fetch(`/api/novels?ids=${ids.join(",")}`).then((r) => r.json()),
};
