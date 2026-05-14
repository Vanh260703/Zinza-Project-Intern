import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import StoryCarousel from '../components/home/StoryCarousel'
import { useAuth } from '../context/AuthContext'
import { getLatestStories, getHotStories, getRecommendedStories, getVipStories, purchaseVip } from '../mocks/stories'

const GRADIENTS = [
  ['#f59e0b','#ef4444'],['#8b5cf6','#3b82f6'],['#10b981','#0891b2'],
  ['#f97316','#eab308'],['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],
  ['#14b8a6','#22c55e'],['#3b82f6','#06b6d4'],['#a855f7','#ec4899'],
  ['#f59e0b','#84cc16'],['#ef4444','#f97316'],['#0ea5e9','#6366f1'],
]

function VipStoryCard({ story, user, onUnlock }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [err, setErr] = useState('')
  const [from, to] = GRADIENTS[(story.gradient ?? 0) % GRADIENTS.length]
  const showImg = story.poster && !imgError
  const isUnlocked = user?.unlockedVip?.includes(story.id)

  async function handleUnlock(e) {
    e.stopPropagation()
    setErr('')
    setPurchasing(true)
    try {
      const data = await purchaseVip(user.email, story.id)
      onUnlock(story.id, data.candy)
    } catch (e) {
      setErr(e.message)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="group flex-shrink-0 w-full">
      {/* Cover */}
      <div
        className="relative rounded-xl overflow-hidden aspect-[3/4] mb-3 cursor-pointer ring-1 ring-amber-500/30 hover:ring-amber-400/60 transition-all"
        onClick={() => isUnlocked && navigate('/story/' + story.id)}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
        {story.poster && (
          <img
            src={story.poster}
            alt={story.title}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${showImg ? 'opacity-100' : 'opacity-0'} ${!isUnlocked ? 'brightness-50' : ''}`}
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

        {/* Lock overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <button
              onClick={handleUnlock}
              disabled={purchasing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors shadow-lg"
            >
              🍬 {purchasing ? 'Đang mở...' : `${story.price} kẹo`}
            </button>
            {err && <p className="text-red-300 text-xs text-center px-2">{err}</p>}
          </div>
        )}

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{story.title}</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3
          className={`text-stone-100 text-sm font-semibold line-clamp-1 transition-colors ${isUnlocked ? 'cursor-pointer hover:text-amber-400' : 'cursor-default'}`}
          onClick={() => isUnlocked && navigate('/story/' + story.id)}
        >
          {story.title}
        </h3>
        <p className="text-stone-500 text-xs">{story.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-stone-500 text-xs">{story.totalChapters?.toLocaleString()} chương</span>
          {isUnlocked ? (
            <span className="text-emerald-400 text-xs font-medium">Đã mở khóa</span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
              🍬 {story.price}
            </span>
          )}
        </div>
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
        to="/login"
        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Đăng nhập ngay
      </Link>
    </div>
  )
}

export default function HomePage() {
  const { user, unlockVip } = useAuth()
  const [latest, setLatest] = useState([])
  const [hot, setHot] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loadingLatest, setLoadingLatest] = useState(true)
  const [loadingHot, setLoadingHot] = useState(true)
  const [loadingRec, setLoadingRec] = useState(true)
  const [vipStories, setVipStories] = useState([])
  const [loadingVip, setLoadingVip] = useState(true)

  useEffect(() => {
    getLatestStories().then((data) => { setLatest(data); setLoadingLatest(false) })
    getHotStories().then((data) => { setHot(data); setLoadingHot(false) })
    getVipStories().then((data) => { setVipStories(data); setLoadingVip(false) })
  }, [])

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
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-medium">Hơn 10,000 truyện đang chờ bạn</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Kho truyện chữ<br />
              <span className="text-amber-400">hàng đầu</span> Việt Nam
            </h1>
            <p className="text-stone-400 text-base mb-7 leading-relaxed">
              Khám phá hàng nghìn bộ truyện tiên hiệp, huyền huyễn, võ hiệp được cập nhật mỗi ngày.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/the-loai"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                Khám phá ngay
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="px-6 py-2.5 border border-stone-600 hover:border-stone-500 text-stone-300 hover:text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Đăng ký miễn phí
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-64 h-64 rounded-full bg-orange-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-16">

        {/* Latest stories */}
        <section>
          <SectionHeader title="Truyện mới nhất" icon="⚡" />
          <StoryCarousel stories={latest} loading={loadingLatest} />
        </section>

        {/* Hot stories */}
        <section>
          <SectionHeader title="Truyện hot" icon="🔥" />
          <StoryCarousel stories={hot} loading={loadingHot} />
        </section>

        {/* Recommended */}
        <section>
          <SectionHeader title="Truyện đề cử" icon="⭐" />
          {!user ? (
            <EmptyRecommended />
          ) : (
            <StoryCarousel stories={recommended} loading={loadingRec} />
          )}
        </section>

        {/* VIP Stories - only for logged-in users */}
        {user && (
          <section>
            <SectionHeader title="Truyện VIP" icon="👑" badge="Nội dung độc quyền" />
            <div className="bg-linear-to-br from-amber-950/20 via-stone-900/50 to-stone-900/20 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-5 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  Truyện VIP là nội dung độc quyền. Dùng <span className="font-semibold text-amber-300">🍬 kẹo</span> để mở khóa và theo dõi truyện.
                  Bạn hiện có <span className="font-bold text-amber-400">{user.candy ?? 0} kẹo</span>.
                </p>
              </div>
              {loadingVip ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                      <div className="aspect-3/4 rounded-xl bg-stone-800 animate-pulse mb-3" />
                      <div className="h-3 bg-stone-800 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-stone-800 rounded animate-pulse w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {vipStories.map((story) => (
                    <VipStoryCard
                      key={story.id}
                      story={story}
                      user={user}
                      onUnlock={unlockVip}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
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
