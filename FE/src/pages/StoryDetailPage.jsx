'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { fetchStoryDetail, fetchChapters, fetchReviews, fetchComments, giftCandy } from '../mocks/story'

/* ── Icons ── */
const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)
const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

/* ── Toast ── */
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-fade-in-up pointer-events-auto
            ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {t.type === 'success'
            ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {t.message}
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  function push(type, message, duration = 3000) {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }
  return { toasts, push }
}

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'tr'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k'
  return String(n)
}

/* ── Gift candy modal ── */
function GiftCandyPopup({ story, onClose }) {
  const { user, updateUser } = useAuth()
  const [amount, setAmount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const ref = useRef()

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  async function handleGift() {
    if (!user) return
    if (amount < 1) return
    setLoading(true)
    try {
      const data = await giftCandy(user.email, amount, story?.title)
      updateUser({ candy: data.candy })
      setResult({ type: 'success', message: `Đã tặng ${amount} kẹo thành công! Số kẹo còn lại: ${data.candy}` })
    } catch (err) {
      setResult({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div ref={ref} className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Tặng kẹo cho tác giả</h3>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <Icon d="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
          </button>
        </div>

        <p className="text-stone-400 text-sm mb-4">
          Tặng kẹo cho <span className="text-amber-400 font-medium">{story?.title}</span>
        </p>

        {!result ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-stone-400 text-sm">Số kẹo:</span>
              <div className="flex items-center gap-2 flex-1">
                {[50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                      ${amount === v ? 'bg-amber-500 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500 mb-2"
            />
            <p className="text-stone-500 text-xs mb-4">Số kẹo hiện có: <span className="text-amber-400">{(user?.candy ?? 0).toLocaleString()}</span></p>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-stone-700 text-stone-300 hover:text-white rounded-lg text-sm font-medium transition-colors">
                Huỷ
              </button>
              <button
                onClick={handleGift}
                disabled={loading || !user || amount > (user?.candy ?? 0)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner />Đang tặng...</> : `🍬 Tặng ${amount} kẹo`}
              </button>
            </div>
          </>
        ) : (
          <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${result.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border border-red-500/30 text-red-400'}`}>
            {result.message}
          </div>
        )}

        {result && (
          <button onClick={onClose} className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-sm font-medium transition-colors">
            Đóng
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Review tab ── */
function ReviewTab({ story, reviews }) {
  if (!reviews) return <div className="flex justify-center py-12"><Spinner /></div>
  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
        <h3 className="text-white font-semibold mb-3">Giới thiệu</h3>
        <div className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">{story?.description}</div>
      </div>
      {/* Reviews */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
        <h3 className="text-white font-semibold mb-5">Đánh giá của độc giả</h3>
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-stone-800 last:border-0 pb-5 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                  {r.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-200 text-sm font-medium">{r.user}</span>
                    <span className="text-stone-600 text-xs">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < r.rating} />)}
                  </div>
                  <p className="text-stone-400 text-sm leading-relaxed">{r.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Unlock chapter modal ── */
function UnlockChapterModal({ chapter, storyId, user, onClose, onUnlocked }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canAfford = (user?.candy ?? 0) >= chapter.candyPrice

  async function handleUnlock() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mock/purchase-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, storyId, chapterNum: chapter.number }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onUnlocked(chapter.number, data.candy)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-sm relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors">
          <Icon d="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center text-2xl shrink-0">🔒</div>
          <div>
            <h3 className="text-white font-semibold mb-1">Chương trả phí</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              <span className="text-stone-200 font-medium line-clamp-1">{chapter.title}</span>
              <br />
              Cần <span className="text-amber-400 font-bold">{chapter.candyPrice} 🍬</span> để mở khoá
            </p>
          </div>
          <div className="w-full bg-stone-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
            <span className="text-stone-500">Kẹo hiện có</span>
            <span className={`font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
              {(user?.candy ?? 0).toLocaleString()} 🍬
            </span>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {!canAfford && !error && (
            <p className="text-red-400 text-xs">
              Không đủ kẹo.{' '}
              <a href="/profile?tab=topup" className="underline hover:text-red-300">Nạp thêm</a>
            </p>
          )}
          <div className="flex gap-3 w-full">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300 rounded-xl text-sm transition-colors">
              Huỷ
            </button>
            <button
              onClick={handleUnlock}
              disabled={loading || !canAfford}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner />Đang mở...</> : `Mở khoá ${chapter.candyPrice} 🍬`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Chapters tab ── */
function ChaptersTab({ storyId, totalChapters, storyPostedBy }) {
  const router = useRouter()
  const { user, unlockChapter } = useAuth()
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [unlockModal, setUnlockModal] = useState(null)
  const LIMIT = 30

  const isOwner = user?.email === storyPostedBy

  function isUnlocked(chapterNum) {
    return isOwner || !!(user?.unlockedChapters?.[`${storyId}_${chapterNum}`])
  }

  useEffect(() => {
    let cancelled = false
    fetchChapters(storyId, page, LIMIT, search).then((d) => { if (!cancelled) setData(d) })
    return () => { cancelled = true; setData(null) }
  }, [storyId, page, search])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  function handleChapterClick(ch) {
    if ((ch.candyPrice ?? 0) > 0 && !isUnlocked(ch.number)) {
      if (!user) { router.push('/login'); return }
      setUnlockModal(ch)
    } else {
      router.push(`/story/${storyId}/read/${ch.number}`)
    }
  }

  function handleUnlocked(chapterNum, newCandy) {
    unlockChapter(storyId, chapterNum, newCandy)
    setUnlockModal(null)
    router.push(`/story/${storyId}/read/${chapterNum}`)
  }

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
      <div className="flex items-center justify-between mb-5 gap-4">
        <h3 className="text-white font-semibold shrink-0">
          Danh sách chương <span className="text-stone-500 font-normal text-sm">({totalChapters?.toLocaleString()} chương)</span>
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm chương..."
            className="bg-stone-800 border border-stone-700 text-stone-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 w-48"
          />
          <button type="submit" className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg transition-colors">
            <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="w-4 h-4" />
          </button>
        </form>
      </div>

      {!data ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-6">
            {data.chapters.map((ch) => {
              const locked = (ch.candyPrice ?? 0) > 0 && !isUnlocked(ch.number)
              const paid = (ch.candyPrice ?? 0) > 0
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChapterClick(ch)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all group
                    ${locked
                      ? 'bg-stone-800/30 border-stone-800/60 hover:border-amber-500/30 hover:bg-stone-800/60'
                      : 'bg-stone-800/50 hover:bg-stone-800 hover:border-amber-500/30 border-transparent'
                    }`}
                >
                  <span className="text-stone-600 text-xs font-mono w-10 shrink-0">#{ch.number}</span>
                  <span className={`text-sm group-hover:text-amber-400 transition-colors truncate flex-1 text-left ${locked ? 'text-stone-500' : 'text-stone-300'}`}>
                    {ch.title}
                  </span>
                  {locked ? (
                    <span className="shrink-0 flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                      🔒 {ch.candyPrice}🍬
                    </span>
                  ) : paid ? (
                    <span className="shrink-0 text-xs text-emerald-400 font-medium">✓ Đã mở</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-all">
                ‹ Trước
              </button>
              <span className="text-stone-500 text-sm px-2">Trang {page} / {data.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-all">
                Sau ›
              </button>
            </div>
          )}
        </>
      )}

      {unlockModal && (
        <UnlockChapterModal
          chapter={unlockModal}
          storyId={storyId}
          user={user}
          onClose={() => setUnlockModal(null)}
          onUnlocked={handleUnlocked}
        />
      )}
    </div>
  )
}

/* ── Ratings tab ── */
const RATING_DIST = [
  { stars: 5, count: 21, pct: 75 },
  { stars: 4, count: 5, pct: 18 },
  { stars: 3, count: 1, pct: 4 },
  { stars: 2, count: 1, pct: 4 },
  { stars: 1, count: 0, pct: 0 },
]

const STAR_LABELS = ['', 'Tệ', 'Không hay', 'Bình thường', 'Hay', 'Tuyệt vời']

function RatingsTab({ story, user, onToast }) {
  const [hover, setHover] = useState(0)
  const [selected, setSelected] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    onToast('success', `Đã gửi đánh giá ${selected} sao${review.trim() ? ' kèm nhận xét' : ''}!`)
  }

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
      <h3 className="text-white font-semibold mb-6">Đánh giá</h3>

      {/* Summary */}
      <div className="flex gap-10 items-center mb-8">
        <div className="text-center shrink-0">
          <p className="text-5xl font-black text-amber-400">{story?.rating}</p>
          <div className="flex items-center justify-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < Math.round(story?.rating || 0)} />)}
          </div>
          <p className="text-stone-500 text-sm">{story?.ratingCount} lượt đánh giá</p>
        </div>
        <div className="flex-1 space-y-2">
          {RATING_DIST.map((r) => (
            <div key={r.stars} className="flex items-center gap-3">
              <span className="text-stone-400 text-xs w-4 text-right">{r.stars}</span>
              <StarIcon filled />
              <div className="flex-1 bg-stone-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="text-stone-500 text-xs w-6">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating form */}
      <div className="border-t border-stone-800 pt-6">
        {!user ? (
          <p className="text-stone-500 text-sm text-center">
            Vui lòng{' '}
            <a href="/login" className="text-amber-400 hover:text-amber-300 underline">đăng nhập</a>
            {' '}để đánh giá truyện.
          </p>
        ) : submitted ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < selected} />)}
            </div>
            <p className="text-stone-300 text-sm font-medium">{STAR_LABELS[selected]}</p>
            {review.trim() && (
              <p className="text-stone-500 text-sm italic max-w-md text-center">"{review.trim()}"</p>
            )}
            <p className="text-emerald-400 text-sm font-medium mt-1">Cảm ơn bạn đã đánh giá!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <p className="text-stone-400 text-sm font-medium">Đánh giá của bạn</p>

            {/* Stars */}
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHover(i + 1)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setSelected(i + 1)}
                  className="transition-transform hover:scale-125"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" viewBox="0 0 24 24"
                    fill={(hover || selected) > i ? '#f59e0b' : 'none'}
                    stroke="#f59e0b" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className={`text-sm font-medium h-5 transition-colors ${selected ? 'text-amber-400' : 'text-transparent'}`}>
              {STAR_LABELS[hover || selected] || '-'}
            </p>

            {/* Review textarea */}
            <div className="w-full max-w-lg">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về truyện... (không bắt buộc)"
                maxLength={1000}
                rows={4}
                className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-xl px-4 py-3 text-stone-200 text-sm placeholder-stone-600 outline-none resize-none transition-colors"
              />
              <p className="text-stone-600 text-xs text-right mt-1">{review.length}/1000</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
            >
              Gửi đánh giá
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Comments tab ── */
function CommentsTab({ comments }) {
  if (!comments) return <div className="flex justify-center py-12"><Spinner /></div>
  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
      <h3 className="text-white font-semibold mb-5">Bình luận <span className="text-stone-500 font-normal text-sm">({comments.length})</span></h3>
      <div className="space-y-5">
        {comments.map((c) => (
          <div key={c.id} className="border-b border-stone-800 last:border-0 pb-5 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-700 flex items-center justify-center text-stone-300 font-bold text-sm shrink-0">
                {c.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-stone-200 text-sm font-medium">{c.user}</span>
                  <span className="text-stone-600 text-xs">{c.date}</span>
                </div>
                <p className="text-stone-400 text-sm leading-relaxed">{c.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main page ── */
const TABS = [
  { key: 'review', label: 'Review truyện' },
  { key: 'chapters', label: 'Danh sách chương' },
  { key: 'ratings', label: 'Đánh giá' },
  { key: 'comments', label: 'Bình luận' },
]

export default function StoryDetailPage() {
  const { id: storyId } = useParams()
  const { user, toggleBookmark } = useAuth()
  const router = useRouter()
  const { toasts, push: pushToast } = useToast()
  const [story, setStory] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [comments, setComments] = useState(null)
  const [activeTab, setActiveTab] = useState('review')
  const [showGift, setShowGift] = useState(false)
  const [posterError, setPosterError] = useState(false)

  const followed = user?.bookmark?.includes(storyId) ?? false

  useEffect(() => {
    fetchStoryDetail(storyId).then(setStory)
    fetchReviews().then((d) => setReviews(d.reviews))
    fetchComments().then((d) => setComments(d.comments))
  }, [storyId])

  const GRADIENTS = ['from-purple-700 to-blue-600', 'from-amber-600 to-red-500']

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      {/* Story header */}
      <div className="bg-linear-to-b from-stone-900 to-stone-950 border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {!story ? (
            <div className="flex gap-8 animate-pulse">
              <div className="w-40 h-56 rounded-2xl bg-stone-800 shrink-0" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-6 bg-stone-800 rounded w-2/3" />
                <div className="h-4 bg-stone-800 rounded w-1/3" />
                <div className="h-4 bg-stone-800 rounded w-1/4" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              {/* Poster */}
              <div className="shrink-0 self-center sm:self-start">
                <div className="w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border border-stone-700 shadow-xl">
                  {!posterError ? (
                    <img
                      src={story.poster}
                      alt={story.title}
                      className="w-full h-full object-cover"
                      onError={() => setPosterError(true)}
                    />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${GRADIENTS[0]} flex items-center justify-center`}>
                      <span className="text-white text-5xl font-black opacity-30">{story.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                    ${story.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {story.status}
                  </span>
                  {story.genres.map((g) => (
                    <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 border border-stone-700">{g}</span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">{story.title}</h1>
                <p className="text-stone-400 text-sm mb-1">
                  Tác giả: <span className="text-stone-300">{story.author}</span>
                </p>
                <p className="text-stone-500 text-sm mb-4">
                  Đăng bởi: <span className="text-stone-400">{story.postedBy}</span>
                </p>

                {/* Stats */}
                <div className="flex items-center gap-5 mb-6 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < Math.round(story.rating)} />)}
                    </div>
                    <span className="text-amber-400 text-sm font-semibold">{story.rating}</span>
                    <span className="text-stone-600 text-xs">({story.ratingCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                    <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-4 h-4" />
                    {formatNum(story.views)}
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                    <Icon d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" className="w-4 h-4" />
                    {formatNum(story.followers)} theo dõi
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                    <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" className="w-4 h-4" />
                    {story.totalChapters?.toLocaleString()} chương
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                    <span>🍬</span>
                    {formatNum(story.nominations)} đề cử
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => router.push(`/story/${storyId}/read/1`)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" className="w-4 h-4" />
                    Đọc ngay
                  </button>
                  <button
                    onClick={() => user ? toggleBookmark(storyId) : router.push('/login')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border
                      ${followed
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'border-stone-700 text-stone-300 hover:border-stone-600 hover:text-white'}`}
                  >
                    <Icon d={followed ? 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' : 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'} className="w-4 h-4" />
                    {followed ? 'Đang theo dõi' : 'Theo dõi'}
                  </button>
                  <button
                    onClick={() => user ? setShowGift(true) : router.push('/login')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:border-amber-500/40 hover:text-amber-400 text-sm font-semibold transition-all"
                  >
                    🍬 Tặng kẹo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex border-b border-stone-800 mt-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-all -mb-px
                ${activeTab === tab.key
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-300'}`}
            >
              {tab.key === 'chapters' && story
                ? `Danh sách chương (${story.totalChapters?.toLocaleString()})`
                : tab.key === 'comments' && story
                  ? `Bình luận (${story.commentCount})`
                  : tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'review' && <ReviewTab story={story} reviews={reviews} />}
          {activeTab === 'chapters' && <ChaptersTab storyId={storyId} totalChapters={story?.totalChapters} storyPostedBy={story?.postedBy} />}
          {activeTab === 'ratings' && <RatingsTab story={story} user={user} onToast={pushToast} />}
          {activeTab === 'comments' && <CommentsTab comments={comments} />}
        </div>
      </div>

      {showGift && <GiftCandyPopup story={story} onClose={() => setShowGift(false)} />}
      <Toast toasts={toasts} />
    </div>
  )
}
