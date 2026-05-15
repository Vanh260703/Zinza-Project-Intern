import { NextRequest, NextResponse } from 'next/server'
import { getMyChapters, addMyChapter, deleteMyChapter, updateInStoryList } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const storyId = req.nextUrl.searchParams.get('storyId') ?? ''
  return NextResponse.json({ chapters: getMyChapters(storyId).slice().reverse() })
}

export async function POST(req: NextRequest) {
  const { email, storyId, title, content, candyPrice } = await req.json() as {
    email: string; storyId: string; title?: string; content: string; candyPrice?: number
  }
  if (!content?.trim()) return NextResponse.json({ message: 'Nội dung chương không được để trống.' }, { status: 400 })
  const chapter = addMyChapter(email, storyId, title ?? '', content.trim(), candyPrice ?? 0)
  if (!chapter) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 })
  const newCount = getMyChapters(storyId).length
  await updateInStoryList(storyId, {
    totalChapters: newCount,
    ...(chapter.candyPrice > 0 && { hasVipChapters: true }),
  })
  return NextResponse.json({ chapter }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl
  const email    = url.searchParams.get('email') ?? ''
  const storyId  = url.searchParams.get('storyId') ?? ''
  const chapterId = url.searchParams.get('chapterId') ?? ''
  const ok = deleteMyChapter(email, storyId, chapterId)
  if (!ok) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 })
  const chapters = getMyChapters(storyId)
  await updateInStoryList(storyId, {
    totalChapters: chapters.length,
    hasVipChapters: chapters.some((c) => (c.candyPrice ?? 0) > 0),
  })
  return NextResponse.json({ message: 'Đã xóa chương.' })
}
