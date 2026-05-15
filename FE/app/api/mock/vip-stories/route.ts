import { NextResponse } from 'next/server'
import { getStoryList } from '@/lib/mock-db'

export async function GET() {
  const list = await getStoryList()
  return NextResponse.json({ stories: list.filter((s) => s.vip || s.hasVipChapters) })
}
