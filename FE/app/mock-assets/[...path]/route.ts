import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params
  const filePath = path.resolve(process.cwd(), 'mocks/upload', ...segments)
  if (!fs.existsSync(filePath)) return new NextResponse(null, { status: 404 })
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' },
  })
}
