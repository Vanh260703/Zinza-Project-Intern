async function fetchStories(sort, limit = 10) {
  const res = await fetch(`/api/mock/stories?sort=${sort}&limit=${limit}`)
  const data = await res.json()
  return data.stories ?? []
}

export async function getLatestStories() {
  return fetchStories('latest', 10)
}

export async function getHotStories() {
  return fetchStories('hot', 10)
}

export async function getRecommendedStories() {
  return fetchStories('rating', 10)
}
