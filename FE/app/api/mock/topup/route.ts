import { NextRequest, NextResponse } from 'next/server'
import { readUsers, writeUsers, addTransaction } from '@/lib/mock-db'

export async function POST(req: NextRequest) {
  const { email, candy, vnd } = await req.json() as { email: string; candy: number; vnd?: number }
  const users = readUsers()
  const idx = users.findIndex((u) => u.email === email)
  if (idx === -1) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const user = users[idx]
  if (!user) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  user.candy = (user.candy ?? 0) + candy
  writeUsers(users)
  addTransaction(email, {
    type: 'topup',
    description: vnd ? `Nạp ${candy} kẹo · ${Number(vnd).toLocaleString('vi-VN')}đ` : `Nạp ${candy} kẹo`,
    candyChange: candy,
    candyAfter: user.candy,
  })
  return NextResponse.json({ candy: user.candy })
}
