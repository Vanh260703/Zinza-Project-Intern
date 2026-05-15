import { NextRequest, NextResponse } from 'next/server'
import { getTransactions } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ message: 'Thiếu email.' }, { status: 400 })
  return NextResponse.json({ transactions: getTransactions(email) })
}
