import { NextRequest, NextResponse } from 'next/server'
import { readUsers, publicUser } from '@/lib/mock-db'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string }
  await new Promise((r) => setTimeout(r, 1200))
  const user = readUsers().find((u) => u.email === email && u.password === password)
  if (!user) return NextResponse.json({ message: 'Email hoặc mật khẩu không chính xác.' }, { status: 401 })
  return NextResponse.json({ user: publicUser(user) })
}
