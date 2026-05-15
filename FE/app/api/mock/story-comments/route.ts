import { NextResponse } from 'next/server'
import { MOCK_COMMENTS } from '@/lib/mock-db'

export async function GET() {
  return NextResponse.json({ comments: MOCK_COMMENTS })
}
