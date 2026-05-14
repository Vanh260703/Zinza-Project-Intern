import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

const GRADIENTS = [
  ['#f59e0b','#ef4444'],['#8b5cf6','#3b82f6'],['#10b981','#0891b2'],
  ['#f97316','#eab308'],['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],
  ['#14b8a6','#22c55e'],['#3b82f6','#06b6d4'],['#a855f7','#ec4899'],
  ['#f59e0b','#84cc16'],['#ef4444','#f97316'],['#0ea5e9','#6366f1'],
]

function StoryCover({ story }) {
  const [from, to] = GRADIENTS[(story.gradient ?? 0) % GRADIENTS.length]
  return (
    <div className="relative w-14 shrink-0 rounded-xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
      {story.poster && (
        <img
          src={story.poster}
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )}
    </div>
  )
}

function SectionHeader({ title, count, icon }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xl">{icon}</span>
      <h2 className="text-white text-lg font-bold">{title}</h2>
      <span className="text-stone-500 text-sm">({count})</span>
      <div className="flex-1 h-px bg-stone-800 ml-1" />
    </div>
  )
}

function EmptySection({ message }) {
  return (
    <div className="flex items-center justify-center py-10 bg-stone-900/50 rounded-xl border border-stone-800 border-dashed">
      <p className="text-stone-600 text-sm">{message}</p>
    </div>
  )
}

function ReadingCard({ story, lastChapter, onRemove }) {
  const navigate = useNavigate()
  return (
    <div className="flex gap-4 p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all">
      <div className="cursor-pointer shrink-0" onClick={() => navigate('/story/' + story.id)}>
        <StoryCover story={story} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p
            className="text-stone-100 text-sm font-semibold line-clamp-1 cursor-pointer hover:text-amber-400 transition-colors"
            onClick={() => navigate('/story/' + story.id)}
          >
            {story.title}
          </p>
          <p className="text-stone-500 text-xs mt-0.5">{story.author}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${story.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {story.status === 'Hoàn thành' ? 'Full' : 'Đang ra'}
            </span>
            <span className="text-stone-600 text-xs">{story.totalChapters?.toLocaleString()} chương</span>
            <span className="text-amber-500/80 text-xs font-medium">Chương {lastChapter}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => navigate(`/story/${story.id}/read/${lastChapter}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Đọc tiếp
          </button>
          <button onClick={onRemove} className="text-xs text-stone-600 hover:text-red-400 transition-colors">
            Xoá khỏi lịch sử
          </button>
        </div>
      </div>
    </div>
  )
}

function BookmarkCard({ story, lastChapter, onRemove }) {
  const navigate = useNavigate()
  return (
    <div className="flex gap-4 p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all">
      <div className="cursor-pointer shrink-0" onClick={() => navigate('/story/' + story.id)}>
        <StoryCover story={story} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p
            className="text-stone-100 text-sm font-semibold line-clamp-1 cursor-pointer hover:text-amber-400 transition-colors"
            onClick={() => navigate('/story/' + story.id)}
          >
            {story.title}
          </p>
          <p className="text-stone-500 text-xs mt-0.5">{story.author}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${story.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {story.status === 'Hoàn thành' ? 'Full' : 'Đang ra'}
            </span>
            <span className="text-stone-600 text-xs">{story.totalChapters?.toLocaleString()} chương</span>
            {lastChapter && <span className="text-stone-500 text-xs">Đọc đến chương {lastChapter}</span>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => navigate(lastChapter ? `/story/${story.id}/read/${lastChapter}` : `/story/${story.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-lg transition-colors"
          >
            {lastChapter ? 'Đọc tiếp' : 'Xem truyện'}
          </button>
          <button onClick={onRemove} className="text-xs text-stone-600 hover:text-red-400 transition-colors">
            Bỏ theo dõi
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LibraryPage() {
  const { user, toggleBookmark, removeFromRead } = useAuth()
  const navigate = useNavigate()
  const [allStories, setAllStories] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  // Fetch story list once on mount
  useEffect(() => {
    fetch('/api/mock/stories?limit=40')
      .then((r) => r.json())
      .then((data) => setAllStories(data.stories ?? []))
      .finally(() => setLoading(false))
  }, [])

  const readHistory = user?.readHistory ?? {}
  const bookmarkIds = user?.bookmark ?? []
  const readIds = Object.keys(readHistory)

  const readingStories = allStories.filter((s) => readIds.includes(s.id))
  const bookmarkStories = allStories.filter((s) => bookmarkIds.includes(s.id))

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 bg-stone-900 rounded-xl animate-pulse">
              <div className="w-14 rounded-xl bg-stone-800" style={{ aspectRatio: '3/4' }} />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-stone-800 rounded w-2/3" />
                <div className="h-3 bg-stone-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Tủ truyện</h1>
          <p className="text-stone-500 text-sm mt-1">Truyện đang đọc và đã theo dõi của bạn</p>
        </div>

        <div className="space-y-10">
          {/* Đang đọc */}
          <section>
            <SectionHeader title="Đang đọc" count={readingStories.length} icon="📖" />
            {readingStories.length === 0 ? (
              <EmptySection message="Bạn chưa đọc truyện nào. Hãy bắt đầu đọc để lưu lịch sử!" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {readingStories.map((s) => (
                  <ReadingCard
                    key={s.id}
                    story={s}
                    lastChapter={readHistory[s.id]}
                    onRemove={() => removeFromRead(s.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Theo dõi */}
          <section>
            <SectionHeader title="Đang theo dõi" count={bookmarkStories.length} icon="🔖" />
            {bookmarkStories.length === 0 ? (
              <EmptySection message="Bạn chưa theo dõi truyện nào. Bấm 'Theo dõi' trên trang chi tiết truyện để lưu vào đây!" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarkStories.map((s) => (
                  <BookmarkCard
                    key={s.id}
                    story={s}
                    lastChapter={readHistory[s.id]}
                    onRemove={() => toggleBookmark(s.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {!readingStories.length && !bookmarkStories.length && (
          <div className="text-center mt-8">
            <Link to="/home" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors">
              Khám phá truyện
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
