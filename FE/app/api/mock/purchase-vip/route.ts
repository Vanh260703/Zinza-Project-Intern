import { NextRequest, NextResponse } from 'next/server'
import { getStoryList, readUsers, writeUsers, addTransaction } from '@/lib/mock-db'

export async function POST(req: NextRequest) {
  const { email, storyId } = await req.json() as { email: string; storyId: string }
  const list = await getStoryList()
  const cacheStory = list.find((s) => s.id === storyId)
  if (!cacheStory || !cacheStory.vip) return NextResponse.json({ message: 'Truyện không phải VIP.' }, { status: 400 })
  const users = readUsers()
  const buyerIdx = users.findIndex((u) => u.email === email)
  if (buyerIdx === -1) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const buyer = users[buyerIdx]
  if (!buyer) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const currentCandy = buyer.candy ?? 0
  if (currentCandy < cacheStory.price) {
    return NextResponse.json({ message: `Không đủ kẹo. Bạn cần ${cacheStory.price} kẹo.` }, { status: 400 })
  }
  buyer.candy = currentCandy - cacheStory.price
  const ownerEmail = cacheStory.postedBy
  if (ownerEmail && ownerEmail !== email) {
    const ownerIdx = users.findIndex((u) => u.email === ownerEmail)
    if (ownerIdx !== -1) {
      const owner = users[ownerIdx]
      if (owner) owner.candy = (owner.candy ?? 0) + cacheStory.price
    }
  }
  writeUsers(users)
  addTransaction(email, {
    type: 'purchase',
    description: `Mua VIP · ${cacheStory.title}`,
    candyChange: -cacheStory.price,
    candyAfter: buyer.candy,
  })
  return NextResponse.json({ candy: buyer.candy })
}
