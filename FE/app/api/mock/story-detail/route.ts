import { NextRequest, NextResponse } from 'next/server'
import { getStoryDetail } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const storyId = req.nextUrl.searchParams.get('id') ?? '100412'
  const story = await getStoryDetail(storyId)
  if (!story) return NextResponse.json({ message: 'Không tìm thấy truyện.' }, { status: 404 })
  return NextResponse.json(story)
}
