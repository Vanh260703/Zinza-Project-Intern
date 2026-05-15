import { NextRequest, NextResponse } from 'next/server'
import { updateMyStory, updateInStoryList } from '@/lib/mock-db'

export async function PUT(req: NextRequest) {
  const { email, id, title, author, genre, description, cover, status } = await req.json() as {
    email: string; id: string; title?: string; author?: string; genre?: string; description?: string; cover?: string | null; status?: string
  }
  const updated = updateMyStory(email, id, {
    ...(title      !== undefined && { title: title.trim() }),
    ...(author     !== undefined && { author: author.trim() }),
    ...(genre      !== undefined && { genre }),
    ...(description !== undefined && { description: description.trim() }),
    ...(status     !== undefined && { status }),
    ...(cover      !== undefined && { cover }),
  })
  if (!updated) return NextResponse.json({ message: 'Không tìm thấy truyện.' }, { status: 404 })
  await updateInStoryList(id, {
    title: updated.title,
    author: updated.author,
    genres: updated.genre ? [updated.genre] : [],
    description: updated.description,
    status: updated.status,
    ...(cover !== undefined && { poster: cover ?? null }),
  })
  return NextResponse.json({ story: updated })
}
