import { NextRequest, NextResponse } from 'next/server'
import { getStoryList, readUsers, getTransactions } from '@/lib/mock-db'
import type { RankEntry } from '@/types/index'

function merge(seed: RankEntry[], real: RankEntry[]): RankEntry[] {
  const map: Record<string, RankEntry> = {}
  seed.forEach((r) => { map[r.key] = { ...r } })
  real.forEach((r) => {
    if (map[r.key]) (map[r.key] as RankEntry).score += r.score
    else map[r.key] = { ...r }
  })
  return Object.values(map)
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const type  = url.searchParams.get('type')  ?? 'reader'
  const limit = Math.min(20, parseInt(url.searchParams.get('limit') ?? '10'))
  const realUsers = readUsers()

  if (type === 'reader') {
    const real: RankEntry[] = realUsers.map((u) => ({ key: u.email, name: u.name, score: u.chaptersRead ?? 0, rank: 0 }))
    const seed: RankEntry[] = [
      { key: 'k1@r.mock', name: 'Kiếm Khách 99',    score: 5420, rank: 0 },
      { key: 'k2@r.mock', name: 'Tiên Hiệp Fan',    score: 4100, rank: 0 },
      { key: 'k3@r.mock', name: 'Long Vân Hiệp',    score: 3280, rank: 0 },
      { key: 'k4@r.mock', name: 'Dark Reader',       score: 2910, rank: 0 },
      { key: 'k5@r.mock', name: 'Phantom 007',       score: 2340, rank: 0 },
      { key: 'k6@r.mock', name: 'Bảo Ngọc',         score: 1950, rank: 0 },
      { key: 'k7@r.mock', name: 'Thuỳ Lam Online',  score: 1680, rank: 0 },
    ]
    const merged = merge(seed, real).sort((a, b) => b.score - a.score).slice(0, limit)
    return NextResponse.json({ rankings: merged.map((r, i) => ({ ...r, rank: i + 1 })) })
  }

  if (type === 'spender') {
    const txReal: Record<string, RankEntry> = {}
    realUsers.forEach((u) => {
      const txs = getTransactions(u.email)
      const spent = txs.filter((t) => t.type === 'purchase' || t.type === 'gift').reduce((s, t) => s + Math.abs(t.candyChange), 0)
      if (spent > 0) txReal[u.email] = { key: u.email, name: u.name, score: spent, rank: 0 }
    })
    const seed: RankEntry[] = [
      { key: 's1@s.mock', name: 'Đại Gia Vô Danh', score: 8800, rank: 0 },
      { key: 's2@s.mock', name: 'Mộng Tiên',       score: 6500, rank: 0 },
      { key: 's3@s.mock', name: 'Vũ Long',          score: 5200, rank: 0 },
      { key: 's4@s.mock', name: 'Bạch Ngọc',        score: 4100, rank: 0 },
      { key: 's5@s.mock', name: 'Kiếm Khách',       score: 3300, rank: 0 },
      { key: 's6@s.mock', name: 'Long Vân',          score: 2800, rank: 0 },
      { key: 's7@s.mock', name: 'Thiên Phú',         score: 2100, rank: 0 },
      { key: 's8@s.mock', name: 'Hoa Hồng Đen',      score: 1500, rank: 0 },
    ]
    const merged = merge(seed, Object.values(txReal)).sort((a, b) => b.score - a.score).slice(0, limit)
    return NextResponse.json({ rankings: merged.map((r, i) => ({ ...r, rank: i + 1 })) })
  }

  if (type === 'topup') {
    const txReal: Record<string, RankEntry> = {}
    realUsers.forEach((u) => {
      const txs = getTransactions(u.email)
      const total = txs.filter((t) => t.type === 'topup').reduce((s, t) => s + t.candyChange, 0)
      if (total > 0) txReal[u.email] = { key: u.email, name: u.name, score: total, rank: 0 }
    })
    const seed: RankEntry[] = [
      { key: 't1@t.mock', name: 'Vương Giả Nạp Kẹo', score: 12000, rank: 0 },
      { key: 't2@t.mock', name: 'Đại Gia Nạp Kẹo',   score: 9500,  rank: 0 },
      { key: 't3@t.mock', name: 'Tiên Hiệp 2024',     score: 7800,  rank: 0 },
      { key: 't4@t.mock', name: 'Long Vương Tiêu',     score: 6200,  rank: 0 },
      { key: 't5@t.mock', name: 'Ngọc Linh',           score: 5100,  rank: 0 },
      { key: 't6@t.mock', name: 'Hoàng Anh',           score: 4300,  rank: 0 },
      { key: 't7@t.mock', name: 'Minh Tuấn',           score: 3600,  rank: 0 },
      { key: 't8@t.mock', name: 'Phương Nga',          score: 2900,  rank: 0 },
    ]
    const merged = merge(seed, Object.values(txReal)).sort((a, b) => b.score - a.score).slice(0, limit)
    return NextResponse.json({ rankings: merged.map((r, i) => ({ ...r, rank: i + 1 })) })
  }

  if (type === 'author') {
    const list = await getStoryList()
    const map: Record<string, RankEntry & { nominations: number }> = {}
    list.forEach((s) => {
      const name = s.isUserStory
        ? (realUsers.find((u) => u.email === s.postedBy)?.name ?? s.author ?? s.postedBy ?? 'Ẩn danh')
        : (s.author || 'Ẩn danh')
      const key = s.isUserStory ? (s.postedBy ?? name) : name
      if (!map[key]) map[key] = { key, name, score: 0, nominations: 0, rank: 0 }
      const entry = map[key]
      if (entry) {
        entry.score += 1
        entry.nominations = (entry.nominations ?? 0) + (s.nominations ?? 0)
      }
    })
    const sorted = Object.values(map).sort((a, b) => b.score - a.score || (b.nominations ?? 0) - (a.nominations ?? 0))
    return NextResponse.json({ rankings: sorted.slice(0, limit).map((r, i) => ({ ...r, rank: i + 1 })) })
  }

  return NextResponse.json({ message: 'Invalid type.' }, { status: 400 })
}
