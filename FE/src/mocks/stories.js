import allStories from '../../mocks/stories/stories.json'

function delay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getLatestStories() {
  await delay()
  return allStories.slice(0, 10)
}

export async function getHotStories() {
  await delay()
  return [...allStories].sort((a, b) => b.views - a.views).slice(0, 10)
}

export async function getRecommendedStories() {
  await delay()
  return [...allStories].sort((a, b) => b.rating - a.rating).slice(0, 10)
}
