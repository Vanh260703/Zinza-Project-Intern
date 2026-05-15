import { NextRequest, NextResponse } from 'next/server'
import { getChapterComments, addChapterComment } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const storyId = url.searchParams.get('storyId') ?? ''
  const chapter = url.searchParams.get('chapter') ?? ''
  return NextResponse.json({ comments: getChapterComments(storyId, chapter) })
}

export async function POST(req: NextRequest) {
  const { storyId, chapter, userName, content } = await req.json() as {
    storyId: string; chapter: string | number; userName: string; content: string
  }
  if (!content?.trim()) return NextResponse.json({ message: 'Nội dung không được để trống.' }, { status: 400 })
  const comment = addChapterComment(storyId, chapter, userName, content)
  return NextResponse.json({ comment }, { status: 201 })
}
