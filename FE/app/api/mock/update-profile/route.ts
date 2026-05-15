import { NextRequest, NextResponse } from 'next/server'
import { readUsers, writeUsers, publicUser } from '@/lib/mock-db'

export async function PUT(req: NextRequest) {
  const { email, name, gender } = await req.json() as { email: string; name: string; gender?: string }
  await new Promise((r) => setTimeout(r, 800))
  const users = readUsers()
  const idx = users.findIndex((u) => u.email === email)
  if (idx === -1) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  const user = users[idx]
  if (!user) return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 })
  user.name = name
  if (gender) user.gender = gender
  writeUsers(users)
  return NextResponse.json({ user: publicUser(user) })
}
