'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import StoryCarousel from '../components/home/StoryCarousel'
import { useAuth } from '../context/AuthContext'
import { getHotStories, getRecommendedStories, getVipStories, fetchFilteredStories } from '../mocks/stories'
import StoryCard from '../components/home/StoryCard'

const GRADIENTS = [
  ['#f59e0b','#ef4444'],['#8b5cf6','#3b82f6'],['#10b981','#0891b2'],
  ['#f97316','#eab308'],['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],
  ['#14b8a6','#22c55e'],['#3b82f6','#06b6d4'],['#a855f7','#ec4899'],
  ['#f59e0b','#84cc16'],['#ef4444','#f97316'],['#0ea5e9','#6366f1'],
]

const FIELD_CLS = 'w-full bg-stone-800 border border-stone-700 hover:border-stone-600 focus:border-amber-500 text-stone-200 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors'
const SELECT_CLS = FIELD_CLS + ' appearance-none cursor-pointer pr-8'

function FilterBar({ genres, onSearch, onReset, hasFilter, defaultValues }) {
  const [q,      setQ]      = useState(defaultValues?.q      ?? '')
  const [genre,  setGenre]  = useState(defaultValues?.genre  ?? '')
  const [status, setStatus] = useState(defaultValues?.status ?? '')
  const [sort,   setSort]   = useState(defaultValues?.sort   ?? 'latest')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(q, genre, status, sort)
  }

  function handleReset() {
    setQ(''); setGenre(''); setStatus(''); setSort('latest')
    onReset()  // clears URL params → navigates to /home base
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 relative z-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 bg-stone-900/80 backdrop-blur-sm border border-stone-700/60 rounded-2xl px-4 py-3"
    >
      {/* Search text — full width on mobile */}
      <div className="relative w-full sm:flex-2 sm:min-w-44">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tên truyện hoặc tác giả..."
          className={FIELD_CLS + ' pl-9'}
        />
      </div>

      {/* Selects — 3 cols on mobile, inline on sm+ */}
      <div className="grid grid-cols-3 sm:contents gap-2">
        <div className="relative">
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={SELECT_CLS}>
            <option value="">Thể loại</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronIcon />
        </div>
        <div className="relative">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={SELECT_CLS}>
            <option value="">Trạng thái</option>
            <option value="Đang ra">Đang ra</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
          <ChevronIcon />
        </div>
        <div className="relative">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={SELECT_CLS}>
            <option value="latest">⚡ Mới nhất</option>
            <option value="views">👁 Lượt xem</option>
            <option value="candy">🍬 Số kẹo tặng</option>
          </select>
          <ChevronIcon />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:shrink-0">
        {hasFilter && (
          <button type="button" onClick={handleReset}
            className="p-2.5 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-xl transition-colors"
            title="Xóa bộ lọc"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button type="submit"
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-amber-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Tìm kiếm
        </button>
      </div>
    </form>
  )
}

function ChevronIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function FilteredResults({ stories, loading, total, hasFilter }) {
  if (!hasFilter) return null

  if (loading) return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-36 bg-stone-800 rounded animate-pulse" />
        <div className="flex-1 h-px bg-stone-700/60" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-3/4 rounded-xl bg-stone-800 animate-pulse mb-3" />
            <div className="h-3 bg-stone-800 rounded animate-pulse mb-2" />
            <div className="h-3 bg-stone-800 rounded w-2/3 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-stone-800 rounded-lg shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold">Kết quả lọc</h2>
        <span className="text-stone-500 text-sm">{total} truyện</span>
        <div className="flex-1 h-px bg-stone-700/60 ml-2" />
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-stone-900/40 rounded-2xl border border-stone-800 border-dashed">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-stone-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-stone-500 text-sm">Không tìm thấy truyện phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stories.map((s) => <StoryCard key={s.id} story={s} />)}
        </div>
      )}
    </section>
  )
}

function VipStoryCard({ story, user }) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [from, to] = GRADIENTS[(story.gradient ?? 0) % GRADIENTS.length]
  const showImg = story.poster && !imgError
  const isOwner = user?.email === story.postedBy

  return (
    <div className="group shrink-0 w-full cursor-pointer" onClick={() => router.push('/story/' + story.id)}>
      {/* Cover */}
      <div className="relative rounded-xl overflow-hidden aspect-3/4 mb-3 ring-1 ring-amber-500/30 hover:ring-amber-400/60 transition-all">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
        {story.poster && (
          <img
            src={story.poster}
            alt={story.title}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${showImg ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        {/* VIP badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          VIP
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${story.status === 'Hoàn thành' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
            {story.status === 'Hoàn thành' ? 'Full' : 'Đang ra'}
          </span>
        </div>

        {/* Owner badge */}
        {isOwner && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <span className="text-xs px-2 py-0.5 bg-black/60 text-amber-300 rounded-full font-medium">Truyện của bạn</span>
          </div>
        )}

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{story.title}</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-stone-100 text-sm font-semibold line-clamp-1 hover:text-amber-400 transition-colors">
          {story.title}
        </h3>
        <p className="text-stone-500 text-xs">{story.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-stone-500 text-xs">{story.totalChapters?.toLocaleString()} chương</span>
          <span className="text-amber-400 text-xs font-medium">🍬 Một số chương mất phí</span>
        </div>
      </div>
    </div>
  )
}

const RANK_STYLES = [
  'text-amber-400 font-black text-base',
  'text-stone-300 font-black text-base',
  'text-amber-700 font-black text-base',
  'text-stone-500 font-bold text-sm',
  'text-stone-500 font-bold text-sm',
]

function TopStoriesPanel() {
  const [tab, setTab] = useState('day')
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mock/stories?sort=views&limit=5')
      .then((r) => r.json())
      .then((d) => { setStories(d.stories ?? []); setLoading(false) })
  }, [])

  const TABS = [
    { key: 'day',   label: 'Ngày'  },
    { key: 'week',  label: 'Tuần'  },
    { key: 'month', label: 'Tháng' },
  ]

  return (
    <div className="bg-stone-900 border border-stone-700/80 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-stone-800">
        <span className="text-base">🏆</span>
        <h3 className="text-white text-sm font-bold flex-1">Bảng xếp hạng</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === t.key ? 'text-amber-400 border-b-2 border-amber-500 -mb-px bg-amber-500/5' : 'text-stone-500 hover:text-stone-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="p-2 space-y-0.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-5 h-4 bg-stone-800 rounded animate-pulse shrink-0" />
              <div className="flex-1 h-3 bg-stone-800 rounded animate-pulse" />
              <div className="w-10 h-3 bg-stone-800 rounded animate-pulse shrink-0" />
            </div>
          ))
        ) : (
          stories.map((s, i) => (
            <Link
              key={s.id}
              href={`/story/${s.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-800/60 transition-colors group"
            >
              <span className={`w-5 shrink-0 text-center ${RANK_STYLES[i]}`}>{i + 1}</span>
              <span className="flex-1 text-stone-300 text-xs font-medium line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                {s.title}
              </span>
              <span className="shrink-0 text-stone-600 text-xs flex items-center gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {(s.nominations ?? 0).toLocaleString()}
              </span>
            </Link>
          ))
        )}
      </div>
      <p className="text-center text-stone-700 text-xs py-2.5">Dữ liệu cập nhật theo mock</p>
    </div>
  )
}

function RandomStorySection() {
  const router = useRouter()
  const [pool, setPool] = useState([])
  const [loading, setLoading] = useState(true)
  const [picked, setPicked] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    fetch('/api/mock/stories?sort=rating&limit=60')
      .then((r) => r.json())
      .then((d) => {
        const qual = (d.stories ?? []).filter((s) => s.rating >= 4.5)
        setPool(qual)
        if (qual.length > 0) setPicked(qual[Math.floor(Math.random() * qual.length)])
        setLoading(false)
      })
  }, [])

  function spin() {
    if (pool.length < 2 || spinning) return
    setSpinning(true)
    setImgError(false)
    setTimeout(() => {
      let next
      do { next = pool[Math.floor(Math.random() * pool.length)] } while (pool.length > 1 && next?.id === picked?.id)
      setPicked(next)
      setSpinning(false)
    }, 420)
  }

  const [from, to] = GRADIENTS[(picked?.gradient ?? 0) % GRADIENTS.length]
  const showImg = picked?.poster && !imgError

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-violet-500/20 rounded-lg">
          <span className="text-violet-400 text-base">🎲</span>
        </div>
        <h2 className="text-white text-xl font-bold">Khám phá ngẫu nhiên</h2>
        <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full font-medium border border-violet-500/30">
          Chất lượng &gt;4.5⭐
        </span>
        <div className="flex-1 h-px bg-stone-700/60 ml-2" />
      </div>

      {loading ? (
        <div className="flex gap-6 p-6 rounded-2xl bg-stone-900 border border-stone-800 animate-pulse">
          <div className="w-36 shrink-0 rounded-xl bg-stone-800" style={{ aspectRatio: '3/4' }} />
          <div className="flex-1 space-y-3 py-2">
            <div className="h-6 bg-stone-800 rounded w-2/3" />
            <div className="h-4 bg-stone-800 rounded w-1/3" />
            <div className="h-4 bg-stone-800 rounded w-1/2" />
            <div className="flex gap-2 mt-3">
              <div className="h-6 bg-stone-800 rounded-full w-16" />
              <div className="h-6 bg-stone-800 rounded-full w-20" />
            </div>
            <div className="h-4 bg-stone-800 rounded w-full mt-2" />
            <div className="h-4 bg-stone-800 rounded w-5/6" />
          </div>
        </div>
      ) : !picked ? null : (
        <div
          className="relative overflow-hidden rounded-2xl border border-stone-700/60 transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${from}18, ${to}10, transparent)` }}
        >
          {/* Faint bg pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top right, ${to}, transparent 65%)` }} />

          <div className="relative flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
            {/* Cover */}
            <div
              className={`relative w-full sm:w-36 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-opacity duration-300 ${spinning ? 'opacity-0' : 'opacity-100'}`}
              style={{ aspectRatio: '3/4' }}
              onClick={() => router.push('/story/' + picked.id)}
            >
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
              {picked.poster && (
                <img
                  src={picked.poster}
                  alt={picked.title}
                  onError={() => setImgError(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${showImg ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
              {!showImg && (
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <span className="text-white font-black" style={{ fontSize: '4rem', lineHeight: 1 }}>
                    {picked.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${picked.status === 'Hoàn thành' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                  {picked.status === 'Hoàn thành' ? 'Full' : 'Đang ra'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className={`flex flex-col justify-between gap-3 min-w-0 transition-opacity duration-300 ${spinning ? 'opacity-0' : 'opacity-100'}`}>
              <div>
                <h3
                  className="text-white text-xl font-bold leading-tight line-clamp-2 cursor-pointer hover:text-amber-400 transition-colors mb-1"
                  onClick={() => router.push('/story/' + picked.id)}
                >
                  {picked.title}
                </h3>
                <p className="text-stone-400 text-sm mb-3">{picked.author}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${picked.rating >= s ? 'fill-amber-400 text-amber-400' : 'fill-stone-700 text-stone-700'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-amber-400 font-bold text-sm">{picked.rating}</span>
                  {picked.ratingCount > 0 && (
                    <span className="text-stone-500 text-xs">({picked.ratingCount.toLocaleString()} đánh giá)</span>
                  )}
                </div>

                {/* Genres */}
                {picked.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {picked.genres.slice(0, 4).map((g) => (
                      <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-400">
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Chapters */}
                <p className="text-stone-500 text-sm">
                  {picked.totalChapters?.toLocaleString()} chương
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => router.push('/story/' + picked.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  style={{ background: `linear-gradient(135deg,${from},${to})` }}
                >
                  Đọc ngay
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={spin}
                  disabled={spinning}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-300 border border-stone-700 hover:border-stone-500 hover:text-white bg-stone-900 transition-all disabled:opacity-50"
                >
                  <span className={`inline-block transition-transform duration-300 ${spinning ? 'rotate-180' : ''}`}>🎲</span>
                  Xoay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function RecentlyReadPanel({ user }) {
  const router = useRouter()
  const [allStories, setAllStories] = useState([])
  const [loading, setLoading] = useState(true)

  const readHistory = user?.readHistory ?? {}
  // Object.keys preserves insertion order → reverse = most recent first
  const recentIds = Object.keys(readHistory).reverse().slice(0, 5)

  useEffect(() => {
    if (!user) return
    fetch('/api/mock/stories?limit=60')
      .then((r) => r.json())
      .then((d) => setAllStories(d.stories ?? []))
      .finally(() => setLoading(false))
  }, [user?.email]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null

  const storyMap = Object.fromEntries(allStories.map((s) => [s.id, s]))
  const recentStories = recentIds.map((id) => storyMap[id]).filter(Boolean)

  return (
    <div className="bg-stone-900 border border-stone-700/80 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-stone-800">
        <span className="text-base">📖</span>
        <h3 className="text-white text-sm font-bold flex-1">Đọc gần đây</h3>
        <Link href="/tu-truyen" className="text-xs text-stone-500 hover:text-amber-400 transition-colors">
          Xem tất cả
        </Link>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="space-y-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2.5 px-2 py-2.5 animate-pulse">
                <div className="w-8 shrink-0 rounded-lg bg-stone-800" style={{ aspectRatio: '3/4' }} />
                <div className="flex-1 space-y-1.5 py-0.5">
                  <div className="h-3 bg-stone-800 rounded w-4/5" />
                  <div className="h-2.5 bg-stone-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center px-3">
            <span className="text-2xl">📚</span>
            <p className="text-stone-500 text-xs leading-relaxed">
              Chưa có lịch sử đọc.
              <br />Hãy khám phá truyện nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recentStories.map((story) => {
              const [from, to] = GRADIENTS[(story.gradient ?? 0) % GRADIENTS.length]
              const lastChapter = readHistory[story.id]
              return (
                <div
                  key={story.id}
                  className="flex gap-2.5 px-2 py-2 rounded-xl hover:bg-stone-800/60 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/story/${story.id}/read/${lastChapter}`)}
                >
                  {/* Mini cover */}
                  <div
                    className="relative w-8 shrink-0 rounded-lg overflow-hidden"
                    style={{ aspectRatio: '3/4', background: `linear-gradient(135deg,${from},${to})` }}
                  >
                    {story.poster && (
                      <img
                        src={story.poster}
                        alt={story.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                    <p className="text-stone-300 text-xs font-medium line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {story.title}
                    </p>
                    <p className="text-stone-600 text-xs">Chương {lastChapter}</p>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, icon, badge }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-8 h-8 bg-amber-500/20 rounded-lg">
        <span className="text-amber-400 text-base">{icon}</span>
      </div>
      <h2 className="text-white text-xl font-bold">{title}</h2>
      {badge && <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-medium border border-amber-500/30">{badge}</span>}
      <div className="flex-1 h-px bg-stone-700/60 ml-2" />
    </div>
  )
}


function EmptyRecommended() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p className="text-stone-400 text-sm font-medium mb-1">Chưa có dữ liệu</p>
      <p className="text-stone-600 text-xs mb-5">Đăng nhập để xem truyện được đề cử dành riêng cho bạn</p>
      <Link
        href="/login"
        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Đăng nhập ngay
      </Link>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [hot, setHot] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loadingHot, setLoadingHot] = useState(true)
  const [loadingRec, setLoadingRec] = useState(true)
  const [vipStories, setVipStories] = useState([])
  const [loadingVip, setLoadingVip] = useState(true)

  // Filter state — driven by URL params
  const [genres, setGenres] = useState([])
  const [filtered, setFiltered] = useState([])
  const [filteredTotal, setFilteredTotal] = useState(0)
  // Track which param string was last successfully fetched — used to derive loading state
  const [fetchedKey, setFetchedKey] = useState(null)

  const pQ      = searchParams.get('q')      ?? ''
  const pGenre  = searchParams.get('genre')  ?? ''
  const pStatus = searchParams.get('status') ?? ''
  const pSort   = searchParams.get('sort')   ?? 'latest'
  const hasFilter = searchParams.has('searched')
  const currentKey = hasFilter ? `${pQ}|${pGenre}|${pStatus}|${pSort}` : null
  // loadingFiltered is derived — no setState needed inside effect
  const loadingFiltered = hasFilter && currentKey !== fetchedKey

  useEffect(() => {
    getHotStories().then((data) => { setHot(data); setLoadingHot(false) })
    getVipStories().then((data) => { setVipStories(data); setLoadingVip(false) })
    fetch('/api/mock/genres').then((r) => r.json()).then((d) => setGenres(d.genres ?? []))
  }, [])

  // Fetch filtered results whenever URL params change
  useEffect(() => {
    if (!hasFilter) return
    let cancelled = false
    fetchFilteredStories({ q: pQ, genre: pGenre, status: pStatus, sort: pSort, limit: 40 })
      .then(({ stories, total }) => {
        if (cancelled) return
        setFiltered(stories)
        setFilteredTotal(total)
        setFetchedKey(`${pQ}|${pGenre}|${pStatus}|${pSort}`)
      })
    return () => { cancelled = true }
  }, [hasFilter, pQ, pGenre, pStatus, pSort])

  function handleSearch(q, genre, status, sort) {
    const params = new URLSearchParams({ searched: '1' })
    if (q)      params.set('q', q)
    if (genre)  params.set('genre', genre)
    if (status) params.set('status', status)
    if (sort && sort !== 'latest') params.set('sort', sort)
    router.push('/home?' + params.toString())
  }

  function handleReset() {
    router.push('/home')
    setFiltered([])
    setFilteredTotal(0)
    setFetchedKey(null)
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    getRecommendedStories().then((data) => {
      if (!cancelled) { setRecommended(data); setLoadingRec(false) }
    })
    return () => { cancelled = true }
  }, [user])

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      {/* Hero banner */}
      <div className="relative bg-linear-to-br from-stone-900 via-amber-950/30 to-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-medium">Hơn 10,000 truyện đang chờ bạn</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 sm:mb-4">
              Kho truyện chữ<br />
              <span className="text-amber-400">hàng đầu</span> Việt Nam
            </h1>
            <p className="text-stone-400 text-sm sm:text-base mb-5 sm:mb-7 leading-relaxed">
              Khám phá hàng nghìn bộ truyện tiên hiệp, huyền huyễn, võ hiệp được cập nhật mỗi ngày.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/home"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                Khám phá ngay
              </Link>
              {!user && (
                <Link
                  href="/register"
                  className="px-6 py-2.5 border border-stone-600 hover:border-stone-500 text-stone-300 hover:text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Đăng ký miễn phí
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <FilterBar
            genres={genres}
            onSearch={handleSearch}
            onReset={handleReset}
            hasFilter={hasFilter}
            defaultValues={{ q: pQ, genre: pGenre, status: pStatus, sort: pSort }}
          />
        </div>

        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-64 h-64 rounded-full bg-orange-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">

        {/* Filtered results */}
        <FilteredResults
          stories={filtered}
          loading={loadingFiltered}
          total={filteredTotal}
          hasFilter={hasFilter}
        />

        {/* Random quality story — hidden when filter active */}
        {!hasFilter && <RandomStorySection />}

        {/* 2-col layout: content (2/3) + ranking (1/3) */}
        {!hasFilter && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">

          {/* Left col — hot, recommended, vip */}
          <div className="lg:col-span-3 space-y-16">
            <section>
              <SectionHeader title="Truyện hot" icon="🔥" />
              <StoryCarousel stories={hot} loading={loadingHot} />
            </section>

            <section>
              <SectionHeader title="Truyện đề cử" icon="⭐" />
              {!user ? (
                <EmptyRecommended />
              ) : (
                <StoryCarousel stories={recommended} loading={loadingRec} />
              )}
            </section>

            {user && (
              <section>
                <SectionHeader title="Truyện VIP" icon="👑" badge="Nội dung độc quyền" />
                <div className="bg-linear-to-br from-amber-950/20 via-stone-900/50 to-stone-900/20 border border-amber-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-3 mb-5 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-amber-300/80 leading-relaxed">
                      Truyện VIP có các chương trả phí. Dùng <span className="font-semibold text-amber-300">🍬 kẹo</span> để mở khoá từng chương.
                      Bạn hiện có <span className="font-bold text-amber-400">{user.candy ?? 0} kẹo</span>.
                    </p>
                  </div>
                  {loadingVip ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                          <div className="aspect-3/4 rounded-xl bg-stone-800 animate-pulse mb-3" />
                          <div className="h-3 bg-stone-800 rounded animate-pulse mb-2" />
                          <div className="h-3 bg-stone-800 rounded animate-pulse w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {vipStories.map((story) => (
                        <VipStoryCard
                          key={story.id}
                          story={story}
                          user={user}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right col — ranking + recently read */}
          <div className="lg:col-span-1 sticky top-24 space-y-4">
            <TopStoriesPanel />
            <RecentlyReadPanel user={user} />
          </div>

        </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-800 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-stone-400 text-sm">© 2025 TruyệnHay</span>
          </div>
          <p className="text-stone-600 text-xs">Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  )
}
