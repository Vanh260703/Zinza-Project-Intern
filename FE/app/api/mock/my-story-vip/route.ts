import { NextRequest, NextResponse } from 'next/server'
import { readUsers, updateMyStory, updateInStoryList, VIP_PRICE } from '@/lib/mock-db'

export async function PUT(req: NextRequest) {
  const { email, id, price, action } = await req.json() as { email: string; id: string; price?: number; action?: string }
  const users = readUsers()
  const u = users.find((u) => u.email === email)
  if (!u || (u.followers ?? 0) < 1000) {
    return NextResponse.json({ message: 'Cần ít nhất 1.000 người theo dõi để mở khoá tính năng VIP.' }, { status: 403 })
  }
  const parsedPrice = Math.max(1, parseInt(String(price)) || VIP_PRICE)
  const story = updateMyStory(email, id, {})
  if (!story) return NextResponse.json({ message: 'Không tìm thấy truyện.' }, { status: 404 })

  let newVip = story.vip ?? false
  let newPrice = story.price ?? 0
  if (action === 'update-price') {
    newPrice = parsedPrice
  } else {
    newVip = !newVip
    if (newVip) newPrice = parsedPrice
  }
  updateMyStory(email, id, { vip: newVip, price: newVip ? newPrice : 0 })
  await updateInStoryList(id, { vip: newVip, price: newVip ? newPrice : 0 })
  return NextResponse.json({ vip: newVip, price: newVip ? newPrice : 0 })
}
