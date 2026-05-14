import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import StoryCarousel from '../components/home/StoryCarousel'
import { useAuth } from '../context/AuthContext'
import { getLatestStories, getHotStories, getRecommendedStories } from '../mocks/stories'

function SectionHeader({ title, icon }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-8 h-8 bg-amber-500/20 rounded-lg">
        <span className="text-amber-400 text-base">{icon}</span>
      </div>
      <h2 className="text-white text-xl font-bold">{title}</h2>
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
  const { user } = useAuth()
  const [latest, setLatest] = useState([])
  const [hot, setHot] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loadingLatest, setLoadingLatest] = useState(true)
  const [loadingHot, setLoadingHot] = useState(true)
  const [loadingRec, setLoadingRec] = useState(true)

  useEffect(() => {
    getLatestStories().then((data) => { setLatest(data); setLoadingLatest(false) })
    getHotStories().then((data) => { setHot(data); setLoadingHot(false) })
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
