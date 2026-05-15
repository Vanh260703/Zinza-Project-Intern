import { NextRequest, NextResponse } from 'next/server'
import { findMyChapter, readUsers, writeUsers, getStoryList, addTransaction } from '@/lib/mock-db'

export async function POST(req: NextRequest) {
  const { email, storyId, chapterNum } = await req.json() as { email: string; storyId: string; chapterNum: number }
  const chapter = findMyChapter(storyId, chapterNum)
  if (!chapter || !(chapter.candyPrice && chapter.candyPrice > 0)) {
    return NextResponse.json({ message: 'Chương này không yêu cầu mở khoá.' }, { status: 400 })
  }
  const users = readUsers()
  const buyerIdx = users.findIndex((u) => u.email === email)
  if (buyerIdx === -1) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const buyer = users[buyerIdx]
  if (!buyer) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const currentCandy = buyer.candy ?? 0
  if (currentCandy < chapter.candyPrice) {
    return NextResponse.json({ message: `Không đủ kẹo. Bạn cần ${chapter.candyPrice} 🍬.` }, { status: 400 })
  }
  buyer.candy = currentCandy - chapter.candyPrice
  const list = await getStoryList()
  const cacheStory = list.find((s) => s.id === storyId)
  const ownerEmail = cacheStory?.postedBy
  if (ownerEmail && ownerEmail !== email) {
    const ownerIdx = users.findIndex((u) => u.email === ownerEmail)
    if (ownerIdx !== -1) {
      const owner = users[ownerIdx]
      if (owner) owner.candy = (owner.candy ?? 0) + chapter.candyPrice
    }
  }
  writeUsers(users)
  addTransaction(email, {
    type: 'purchase',
    description: `Mở khoá chương ${chapterNum} · ${cacheStory?.title ?? storyId}`,
    candyChange: -(chapter.candyPrice),
    candyAfter: buyer.candy,
  })
  return NextResponse.json({ candy: buyer.candy })
}
