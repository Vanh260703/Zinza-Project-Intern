import { NextRequest, NextResponse } from 'next/server'
import { getStoryList } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const sort   = url.searchParams.get('sort')   ?? 'latest'
  const limit  = Math.min(40, parseInt(url.searchParams.get('limit') ?? '10'))
  const q      = (url.searchParams.get('q')      ?? '').toLowerCase().trim()
  const genre  = (url.searchParams.get('genre')  ?? '').trim()
  const status = (url.searchParams.get('status') ?? '').trim()

  let list = (await getStoryList()).filter((s) => !s.vip)

  if (q)      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q))
  if (genre)  list = list.filter((s) => s.genres?.includes(genre))
  if (status) list = list.filter((s) => s.status === status)

  if      (sort === 'hot'   ) list.sort((a, b) => b.nominations - a.nominations)
  else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
  else if (sort === 'views' ) list.sort((a, b) => b.nominations - a.nominations)
  else if (sort === 'candy' ) list.sort((a, b) => (b.nominations * 10 + b.ratingCount) - (a.nominations * 10 + a.ratingCount))
  else list.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : parseInt(a.id)
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : parseInt(b.id)
    return tB - tA
  })

  return NextResponse.json({ stories: list.slice(0, limit), total: list.length })
}
