import { NextRequest, NextResponse } from 'next/server'
import { findMyChapter, readChapterContent, getStoryList } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const storyId    = url.searchParams.get('storyId') ?? '100412'
  const chapterNum = url.searchParams.get('chapter')
  if (!chapterNum) return NextResponse.json({ message: 'Thiếu số chương.' }, { status: 400 })

  // User-created story
  const userCh = findMyChapter(storyId, parseInt(chapterNum))
  if (userCh) {
    const list = await getStoryList()
    const cacheStory = list.find((s) => s.id === storyId)
    return NextResponse.json({ content: userCh.content, candyPrice: userCh.candyPrice ?? 0, ownerEmail: cacheStory?.postedBy ?? '' })
  }

  // Disk story
  const content = readChapterContent(storyId, parseInt(chapterNum))
  if (!content) return NextResponse.json({ message: 'Không tìm thấy chương.' }, { status: 404 })
  return NextResponse.json({ content, candyPrice: 0, ownerEmail: '' })
}
