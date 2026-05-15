'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/layout/Navbar'
import { fetchChapterContent, fetchStoryDetail, fetchChapterComments, postChapterComment } from '../mocks/story'
import { useAuth } from '../context/AuthContext'

/* ── Lock wall ── */
function LockWall({ storyId, chapter, user, onUnlocked }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canAfford = (user?.candy ?? 0) >= chapter.candyPrice

  async function handleUnlock() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mock/purchase-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, storyId, chapterNum: chapter.num }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onUnlocked(data.candy)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl mb-5">🔒</div>
      <h2 className="text-white text-lg font-bold mb-2">Chương trả phí</h2>
      <p className="text-stone-400 text-sm mb-6 max-w-sm leading-relaxed">
        Cần <span className="text-amber-400 font-bold">{chapter.candyPrice} 🍬</span> để mở khoá chương này.
        {!user && <> <a href="/login" className="text-amber-400 underline hover:text-amber-300">Đăng nhập</a> để tiếp tục.</>}
      </p>
      {user && (
        <div className="w-full max-w-xs space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-stone-500">Kẹo hiện có</span>
            <span className={`font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>{(user.candy ?? 0).toLocaleString()} 🍬</span>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {!canAfford && !error && (
            <p className="text-red-400 text-xs">
              Không đủ kẹo.{' '}
              <a href="/profile?tab=topup" className="underline hover:text-red-300">Nạp thêm</a>
            </p>
          )}
          <button
            onClick={handleUnlock}
            disabled={loading || !canAfford}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading
              ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Đang mở...</>
              : `Mở khoá ${chapter.candyPrice} 🍬`}
          </button>
        </div>
      )}
    </div>
  )
}

function NavButtons({ bottom, num, storyId, isFirst, isLast, onGoTo }) {
  return (
    <div className={`flex items-center gap-3 ${bottom ? 'justify-between' : ''}`}>
      <button
        onClick={() => onGoTo(num - 1)}
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
          href={`/story/${storyId}`}
          className="flex items-center gap-1.5 px-4 py-2 border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-stone-200 text-sm rounded-xl transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Thông tin truyện
        </Link>
      )}

      <button
        onClick={() => onGoTo(num + 1)}
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
}

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

function ChapterComments({ storyId, chapterNum, user }) {
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setTimeout(() => {
      if (cancelled) return
      setLoadingComments(true)
      fetchChapterComments(storyId, chapterNum)
        .then((data) => { if (!cancelled) setComments(data.comments ?? []) })
        .finally(() => { if (!cancelled) setLoadingComments(false) })
    }, 0)
    return () => { cancelled = true }
  }, [storyId, chapterNum])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const data = await postChapterComment(storyId, chapterNum, user.name ?? user.email, text)
      setComments((prev) => [data.comment, ...prev])
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
      <div className="border-t border-stone-800 pt-8">
        <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4-4-4z" />
          </svg>
          Bình luận chương
          {!loadingComments && <span className="text-stone-500 text-sm font-normal">({comments.length})</span>}
        </h3>

        {user ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              rows={3}
              className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-200 text-sm rounded-xl px-4 py-3 outline-none transition-colors resize-none placeholder:text-stone-600"
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-stone-900 rounded-xl border border-stone-800 text-center">
            <p className="text-stone-500 text-sm">
              <a href="/login" className="text-amber-400 hover:text-amber-300 underline">Đăng nhập</a> để bình luận.
            </p>
          </div>
        )}

        {loadingComments ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-stone-600 text-sm text-center py-6">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center shrink-0 text-xs text-stone-300 font-bold">
                  {(c.user ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-stone-200 text-sm font-medium">{c.user}</span>
                    <span className="text-stone-600 text-xs">{c.date}</span>
                  </div>
                  <p className="text-stone-400 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChapterReadPage() {
  const { id: storyId, chapterNum } = useParams()
  const router = useRouter()
  const { user, updateReadHistory, unlockChapter } = useAuth()
  const num = parseInt(chapterNum)

  const [content, setContent] = useState(null)
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [candyPrice, setCandyPrice] = useState(0)
  const [ownerEmail, setOwnerEmail] = useState('')
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
    topRef.current?.scrollIntoView({ behavior: 'instant' })
    setTimeout(() => {
      if (cancelled) return
      setLoading(true)
      setError(false)
      setContent(null)
      fetchChapterContent(storyId, num)
        .then((data) => {
          if (cancelled) return
          if (data?.content !== undefined) {
            const price = data.candyPrice ?? 0
            const owner = data.ownerEmail ?? ''
            setCandyPrice(price)
            setOwnerEmail(owner)
            setContent(data.content)
            const locked = price > 0 && user?.email !== owner && !user?.unlockedChapters?.[`${storyId}_${num}`]
            if (user && !locked) updateReadHistory(storyId, num)
          } else setError(true)
        })
        .catch(() => { if (!cancelled) setError(true) })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 0)
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, num])

  function changeFontSize(cls) {
    setFontSize(cls)
    localStorage.setItem('readFontSize', cls)
  }

  function goTo(n) {
    const total = story?.totalChapters ?? Infinity
    if (n < 1 || n > total) return
    router.push(`/story/${storyId}/read/${n}`)
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
  const isOwner = !!ownerEmail && user?.email === ownerEmail
  const isUnlocked = !!(user?.unlockedChapters?.[`${storyId}_${num}`])
  const isLocked = !loading && !error && candyPrice > 0 && !isOwner && !isUnlocked

  function handleUnlocked(newCandy) {
    unlockChapter(storyId, num, newCandy)
    updateReadHistory(storyId, num)
  }

  return (
    <div className="min-h-screen bg-stone-950" ref={topRef}>
      <Navbar />

      {/* Reading toolbar */}
      <div className="sticky top-16 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 flex-wrap">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 flex-1 min-w-0 overflow-hidden">
            <Link href="/home" className="hover:text-stone-300 transition-colors shrink-0">Trang chủ</Link>
            <span className="shrink-0">/</span>
            <Link href={`/story/${storyId}`} className="hover:text-stone-300 transition-colors truncate">
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
            <NavButtons num={num} storyId={storyId} isFirst={isFirst} isLast={isLast} onGoTo={goTo} />
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
            <Link href={`/story/${storyId}`} className="text-amber-400 hover:text-amber-300 text-sm underline">
              Quay lại thông tin truyện
            </Link>
          </div>
        ) : isLocked ? (
          <LockWall
            storyId={storyId}
            chapter={{ num, candyPrice }}
            user={user}
            onUnlocked={handleUnlocked}
          />
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
      {!loading && !error && !isLocked && (
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-8 border-t border-stone-800 pt-8">
          <NavButtons bottom num={num} storyId={storyId} isFirst={isFirst} isLast={isLast} onGoTo={goTo} />
        </div>
      )}

      {/* Chapter comments */}
      {!loading && !error && !isLocked && (
        <ChapterComments storyId={storyId} chapterNum={num} user={user} />
      )}
    </div>
  )
}
