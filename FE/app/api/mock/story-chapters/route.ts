import { NextRequest, NextResponse } from 'next/server'
import { storyDirById, getTitleCache, getChapterPage, getMyChapters } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const storyId = url.searchParams.get('storyId') ?? '100412'
  const page    = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1'))
  const limit   = Math.min(50, parseInt(url.searchParams.get('limit') ?? '30'))
  const search  = (url.searchParams.get('search') ?? '').toLowerCase()

  const dir = storyDirById(storyId)

  if (!dir) {
    // User-created story
    const userChs = getMyChapters(storyId)
    if (!userChs.length) return NextResponse.json({ message: 'Không tìm thấy truyện.' }, { status: 404 })
    let chList = [...userChs].sort((a, b) => a.number - b.number)
    if (search) chList = chList.filter((c) => c.title.toLowerCase().includes(search))
    const start = (page - 1) * limit
    const paged = chList.slice(start, start + limit).map((c) => ({ number: c.number, id: c.id, title: c.title, candyPrice: c.candyPrice ?? 0 }))
    return NextResponse.json({ chapters: paged, total: chList.length, page, limit, totalPages: Math.ceil(chList.length / limit) })
  }

  if (search) {
    const all = getTitleCache(storyId)
    const filtered = all.filter((c) => c.title.toLowerCase().includes(search))
    const start = (page - 1) * limit
    return NextResponse.json({
      chapters: filtered.slice(start, start + limit),
      total: filtered.length,
      page, limit,
      totalPages: Math.ceil(filtered.length / limit),
    })
  }

  const { chapters, total, totalPages } = getChapterPage(storyId, page, limit)
  return NextResponse.json({ chapters, total, page, limit, totalPages })
}
