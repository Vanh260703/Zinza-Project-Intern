export async function fetchStoryDetail(storyId = '100412') {
  const res = await fetch(`/api/mock/story-detail?id=${storyId}`)
  return res.json()
}

export async function fetchChapters(storyId = '100412', page = 1, limit = 30, search = '') {
  const params = new URLSearchParams({ storyId, page, limit, ...(search && { search }) })
  const res = await fetch(`/api/mock/story-chapters?${params}`)
  return res.json()
}

export async function fetchChapterContent(storyId = '100412', chapterNum) {
  const res = await fetch(`/api/mock/story-chapter-content?storyId=${storyId}&chapter=${chapterNum}`)
  return res.json()
}

export async function fetchReviews() {
  const res = await fetch('/api/mock/story-reviews')
  return res.json()
}

export async function fetchComments() {
  const res = await fetch('/api/mock/story-comments')
  return res.json()
}

export async function giftCandy(email, amount) {
  const res = await fetch('/api/mock/gift-candy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}
