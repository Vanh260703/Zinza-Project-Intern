import { NextRequest, NextResponse } from 'next/server'
import { readUsers, writeUsers } from '@/lib/mock-db'

export async function PUT(req: NextRequest) {
  const { email, currentPassword, newPassword } = await req.json() as { email: string; currentPassword: string; newPassword: string }
  await new Promise((r) => setTimeout(r, 800))
  const users = readUsers()
  const idx = users.findIndex((u) => u.email === email)
  if (idx === -1) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const user = users[idx]
  if (!user) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  if (user.password !== currentPassword) return NextResponse.json({ message: 'Mật khẩu hiện tại không đúng.' }, { status: 400 })
  user.password = newPassword
  writeUsers(users)
  return NextResponse.json({ message: 'Đổi mật khẩu thành công.' })
}
