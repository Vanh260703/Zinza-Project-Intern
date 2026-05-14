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

export async function fetchFilteredStories({ q = '', genre = '', status = '', sort = 'latest', limit = 40 } = {}) {
  const params = new URLSearchParams({ sort, limit })
  if (q)      params.set('q', q)
  if (genre)  params.set('genre', genre)
  if (status) params.set('status', status)
  const res = await fetch(`/api/mock/stories?${params}`)
  const data = await res.json()
  return { stories: data.stories ?? [], total: data.total ?? 0 }
}

export async function getVipStories() {
  const res = await fetch('/api/mock/vip-stories')
  const data = await res.json()
  return data.stories ?? []
}

export async function purchaseVip(email, storyId) {
  const res = await fetch('/api/mock/purchase-vip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, storyId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}
