import { NextResponse } from 'next/server'
import { MOCK_REVIEWS } from '@/lib/mock-db'

export async function GET() {
  return NextResponse.json({ reviews: MOCK_REVIEWS })
}
