import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { fetchChapterContent, fetchStoryDetail } from '../mocks/story'
import { useAuth } from '../context/AuthContext'

const FONT_SIZES = [
  { label: 'Nhỏ',  cls: 'text-sm',  px: 14 },
  { label: 'Vừa',  cls: 'text-base', px: 16 },
  { label: 'Lớn',  cls: 'text-lg',  px: 18 },
  { label: 'To',   cls: 'text-xl',  px: 20 },
]

const Spinner = () => (
  <svg className="animate-spin w-5 h-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

export default function ChapterReadPage() {
  const { id: storyId, chapterNum } = useParams()
  const navigate = useNavigate()
  const { user, updateReadHistory } = useAuth()
  const num = parseInt(chapterNum)

  const [content, setContent] = useState(null)
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('readFontSize') || 'text-base'
  )
  const [jumpInput, setJumpInput] = useState('')
  const topRef = useRef()

  /* Fetch story info once */
  useEffect(() => {
    fetchStoryDetail(storyId).then(setStory)
  }, [storyId])

  /* Fetch chapter content on num change */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    setContent(null)
    topRef.current?.scrollIntoView({ behavior: 'instant' })

    fetchChapterContent(storyId, num)
      .then((data) => {
        if (cancelled) return
        if (data?.content) {
          setContent(data.content)
          if (user) updateReadHistory(storyId, num)
        } else setError(true)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [storyId, num])

  function changeFontSize(cls) {
    setFontSize(cls)
    localStorage.setItem('readFontSize', cls)
  }

  function goTo(n) {
    const total = story?.totalChapters ?? Infinity
    if (n < 1 || n > total) return
    navigate(`/story/${storyId}/read/${n}`)
  }

  function handleJump(e) {
    e.preventDefault()
    const n = parseInt(jumpInput)
    if (n) goTo(n)
    setJumpInput('')
  }

  /* Parse first line = title, rest = body paragraphs */
  const lines = (content ?? '').split('\n')
  const chapterTitle = lines[0]?.trim() || `Chương ${num}`
  const paragraphs = lines.slice(1).join('\n').trim().split(/\n\n+/).filter(Boolean)

  const isFirst = num <= 1
  const isLast = !!story?.totalChapters && num >= story.totalChapters

  const NavButtons = ({ bottom }) => (
    <div className={`flex items-center gap-3 ${bottom ? 'justify-between' : ''}`}>
      <button
        onClick={() => goTo(num - 1)}
        disabled={isFirst}
        className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-35 disabled:cursor-not-allowed text-stone-300 text-sm rounded-xl transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {bottom ? 'Chương trước' : 'Trước'}
      </button>

      {bottom && (
        <Link
          to={`/story/${storyId}`}
          className="flex items-center gap-1.5 px-4 py-2 border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-stone-200 text-sm rounded-xl transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Thông tin truyện
        </Link>
      )}

      <button
        onClick={() => goTo(num + 1)}
        disabled={isLast}
        className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-35 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-colors shadow-lg shadow-amber-600/20"
      >
        {bottom ? 'Chương sau' : 'Sau'}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950" ref={topRef}>
      <Navbar />

      {/* Reading toolbar */}
      <div className="sticky top-16 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 flex-wrap">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 flex-1 min-w-0 overflow-hidden">
            <Link to="/home" className="hover:text-stone-300 transition-colors shrink-0">Trang chủ</Link>
            <span className="shrink-0">/</span>
            <Link to={`/story/${storyId}`} className="hover:text-stone-300 transition-colors truncate">
              {story?.title ?? '...'}
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-stone-400 shrink-0">Chương {num}</span>
          </div>

          {/* Font size */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-stone-600 text-xs mr-0.5">Aa</span>
            {FONT_SIZES.map((f) => (
              <button
                key={f.cls}
                onClick={() => changeFontSize(f.cls)}
                title={`${f.label} (${f.px}px)`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                  ${fontSize === f.cls
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Chapter jump */}
          <form onSubmit={handleJump} className="flex items-center gap-1.5 shrink-0">
            <span className="text-stone-600 text-xs">Chap</span>
            <input
              type="number"
              min={1}
              max={story?.totalChapters}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={String(num)}
              className="w-16 bg-stone-800 border border-stone-700 focus:border-amber-500 text-stone-200 text-xs text-center rounded-lg px-2 py-1.5 outline-none transition-colors"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition-colors"
            >
              Đi
            </button>
          </form>

          {/* Prev/Next compact */}
          <div className="shrink-0">
            <NavButtons />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Spinner />
            <p className="text-stone-600 text-sm">Đang tải chương {num}...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-stone-400 text-base mb-2">Không tìm thấy chương này.</p>
            <Link to={`/story/${storyId}`} className="text-amber-400 hover:text-amber-300 text-sm underline">
              Quay lại thông tin truyện
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-white text-xl sm:text-2xl font-bold text-center mb-10 leading-snug">
              {chapterTitle}
            </h1>
            <div className={`${fontSize} text-stone-300 leading-[1.95] space-y-5 selection:bg-amber-500/30`}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom navigation */}
      {!loading && !error && (
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-16 border-t border-stone-800 pt-8">
          <NavButtons bottom />
        </div>
      )}
    </div>
  )
}
