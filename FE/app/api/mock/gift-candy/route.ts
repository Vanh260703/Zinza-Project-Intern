import { NextRequest, NextResponse } from 'next/server'
import { readUsers, writeUsers, addTransaction } from '@/lib/mock-db'

export async function POST(req: NextRequest) {
  const { email, amount, storyTitle } = await req.json() as { email: string; amount: number; storyTitle?: string }
  const users = readUsers()
  const idx = users.findIndex((u) => u.email === email)
  if (idx === -1) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const user = users[idx]
  if (!user) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  if ((user.candy ?? 0) < amount) return NextResponse.json({ message: 'Số kẹo không đủ.' }, { status: 400 })
  user.candy = (user.candy ?? 0) - amount
  writeUsers(users)
  addTransaction(email, {
    type: 'gift',
    description: storyTitle ? `Tặng kẹo · ${storyTitle}` : 'Tặng kẹo cho tác giả',
    candyChange: -amount,
    candyAfter: user.candy,
  })
  return NextResponse.json({ candy: user.candy })
}
