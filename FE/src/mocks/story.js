export async function fetchStoryDetail() {
  const res = await fetch('/api/mock/story-detail')
  return res.json()
}

export async function fetchChapters(page = 1, limit = 30, search = '') {
  const params = new URLSearchParams({ page, limit, ...(search && { search }) })
  const res = await fetch(`/api/mock/story-chapters?${params}`)
  return res.json()
}

export async function fetchChapterContent(chapterNum) {
  const res = await fetch(`/api/mock/story-chapter-content?chapter=${chapterNum}`)
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
