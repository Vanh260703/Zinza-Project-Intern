import { NextResponse } from 'next/server'
import { getStoryList } from '@/lib/mock-db'

export async function GET() {
  const list = await getStoryList()
  const genres = [...new Set(list.flatMap((s) => s.genres).filter(Boolean))]
  return NextResponse.json({ genres })
}
