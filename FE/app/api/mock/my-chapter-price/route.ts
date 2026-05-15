import { NextRequest, NextResponse } from 'next/server'
import { readUsers, setChapterPrice, getMyChapters, updateInStoryList } from '@/lib/mock-db'

export async function PUT(req: NextRequest) {
  const { email, storyId, chapterId, candyPrice } = await req.json() as {
    email: string; storyId: string; chapterId: string; candyPrice: number
  }
  const users = readUsers()
  const u = users.find((u) => u.email === email)
  if (!u || (u.followers ?? 0) < 1000) {
    return NextResponse.json({ message: 'Cần ít nhất 1.000 người theo dõi để đặt giá chương.' }, { status: 403 })
  }
  const newPrice = setChapterPrice(email, storyId, chapterId, candyPrice)
  if (newPrice === null) return NextResponse.json({ message: 'Không tìm thấy chương.' }, { status: 404 })
  const chapters = getMyChapters(storyId)
  await updateInStoryList(storyId, { hasVipChapters: chapters.some((c) => (c.candyPrice ?? 0) > 0) })
  return NextResponse.json({ candyPrice: newPrice })
}
