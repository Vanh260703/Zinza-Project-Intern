import { NextRequest, NextResponse } from 'next/server'
import { getMyStories, addMyStory, deleteMyStory, pushToStoryList, removeFromStoryList, getStoryList } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ message: 'Thiếu email.' }, { status: 400 })
  return NextResponse.json({ stories: getMyStories(email) })
}

export async function POST(req: NextRequest) {
  const { email, title, author, genre, description, cover, fromZip } = await req.json() as {
    email: string; title: string; author?: string; genre?: string; description?: string; cover?: string | null; fromZip?: string | null
  }
  if (!email || !title?.trim()) return NextResponse.json({ message: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
  const story = addMyStory(email, { title: title.trim(), author: author?.trim() ?? '', genre: genre ?? '', description: description?.trim() ?? '', cover: cover ?? null, fromZip: fromZip ?? null })
  const list = await getStoryList()
  await pushToStoryList({
    id: story.id,
    slug: `user-story-${story.id}`,
    title: story.title,
    type: 'Truyện chữ',
    target: '',
    status: story.status,
    rating: 0, ratingCount: 0, commentCount: 0, nominations: 0,
    author: story.author,
    postedBy: email,
    genres: story.genre ? [story.genre] : [],
    tags: [],
    description: story.description,
    poster: story.cover ?? null,
    gradient: list.length % 12,
    vip: false, price: 0,
    hasVipChapters: false,
    totalChapters: 0,
    isUserStory: true,
    views: 0, followers: 0,
    createdAt: story.createdAt,
  })
  return NextResponse.json({ story }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl
  const email = url.searchParams.get('email')
  const id    = url.searchParams.get('id')
  if (!email || !id) return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 })
  deleteMyStory(email, id)
  await removeFromStoryList(id)
  return NextResponse.json({ message: 'Đã xóa.' })
}
