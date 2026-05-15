import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.resolve(process.cwd(), 'mocks/fake-qr.jpeg')
  if (!fs.existsSync(filePath)) return new NextResponse(null, { status: 404 })
  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
  })
}
