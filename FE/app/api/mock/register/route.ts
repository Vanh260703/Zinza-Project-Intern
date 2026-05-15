import { NextRequest, NextResponse } from 'next/server'
import { readUsers, writeUsers } from '@/lib/mock-db'

export async function POST(req: NextRequest) {
  const { email, name, gender, password } = await req.json() as { email: string; name: string; gender: string; password: string }
  await new Promise((r) => setTimeout(r, 1200))
  const users = readUsers()
  if (users.find((u) => u.email === email)) {
    return NextResponse.json({ message: 'Email này đã được sử dụng.' }, { status: 409 })
  }
  users.push({ email, name, gender, password, candy: 0, chaptersRead: 0 })
  writeUsers(users)
  return NextResponse.json({ message: 'Đăng ký thành công.' }, { status: 201 })
}
