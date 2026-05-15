'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'

const GRADIENTS = [
  ['#f59e0b','#ef4444'],['#8b5cf6','#3b82f6'],['#10b981','#0891b2'],
  ['#f97316','#eab308'],['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],
  ['#14b8a6','#22c55e'],['#3b82f6','#06b6d4'],['#a855f7','#ec4899'],
  ['#f59e0b','#84cc16'],['#ef4444','#f97316'],['#0ea5e9','#6366f1'],
]

function SearchBox({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef()
  const timerRef = useRef()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    setLoading(true)
    fetch(`/api/mock/stories?q=${encodeURIComponent(q)}&limit=6`)
      .then((r) => r.json())
      .then((data) => { setResults(data.stories ?? []); setOpen(true) })
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const v = e.target.value
    setQuery(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(v), 300)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  function handleSelect(id) {
    setOpen(false)
    setQuery('')
    onNavigate(id)
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className={`flex items-center gap-2 bg-stone-800/70 border rounded-xl px-3 py-2 transition-all w-52 focus-within:w-72 focus-within:border-amber-500/60 ${open && results.length ? 'border-amber-500/60' : 'border-stone-700'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 shrink-0 transition-colors ${loading ? 'text-amber-400 animate-pulse' : 'text-stone-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Tìm truyện, tác giả..."
          className="bg-transparent text-stone-200 text-sm placeholder-stone-500 outline-none w-full"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }} className="text-stone-500 hover:text-stone-300 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-stone-800 border border-stone-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-stone-500 text-sm">Không tìm thấy kết quả.</p>
          ) : (
            <ul>
              {results.map((s) => {
                const [from, to] = GRADIENTS[s.gradient % GRADIENTS.length]
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => handleSelect(s.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-stone-700/60 transition-colors text-left"
                    >
                      <div className="w-9 h-12 rounded-lg overflow-hidden shrink-0 relative">
                        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
                        {s.poster && (
                          <img src={s.poster} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-100 text-sm font-medium truncate">{s.title}</p>
                        <p className="text-stone-500 text-xs truncate">{s.author}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${s.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {s.status === 'Hoàn thành' ? 'Full' : 'Đang ra'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: '👑', title: 'Tính năng VIP đã được mở khoá', desc: 'Bạn đã đạt 1.000 người theo dõi.', time: '2 giờ trước', unread: true },
  { id: 2, icon: '🍬', title: 'Có người mua truyện VIP của bạn', desc: 'Nhận được 50 kẹo từ "Thiên Đạo Đồ Thư Quán".', time: '5 giờ trước', unread: true },
  { id: 3, icon: '💬', title: 'Bình luận mới', desc: 'Có người bình luận vào chương 12 truyện của bạn.', time: 'Hôm qua', unread: false },
  { id: 4, icon: '⭐', title: 'Truyện của bạn được đề cử', desc: '"Vũ Động Càn Khôn" vừa được thêm vào đề cử.', time: '2 ngày trước', unread: false },
]

function NotificationBell({ router }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const ref = useRef(null)
  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleClickNotif(notif) {
    setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, unread: false } : n))
    setOpen(false)
    router.push('/profile?tab=notifications')
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bell-hover relative p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-700/60 transition-colors"
        aria-label="Thông báo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="bell-icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-stone-800/95 backdrop-blur-sm border border-stone-700/80 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700/60">
            <span className="text-white text-sm font-semibold">Thông báo</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-amber-400 hover:text-amber-300 text-xs transition-colors">
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-stone-500 text-sm">Không có thông báo nào.</li>
            ) : notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleClickNotif(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-stone-700/50 transition-colors text-left ${n.unread ? 'bg-amber-500/5' : ''}`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug truncate ${n.unread ? 'text-white font-medium' : 'text-stone-300'}`}>{n.title}</p>
                    <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">{n.desc}</p>
                    <p className="text-stone-600 text-xs mt-1">{n.time}</p>
                  </div>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />}
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-stone-700/60">
            <button
              onClick={() => { setOpen(false); router.push('/profile?tab=notifications') }}
              className="w-full py-3 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors hover:bg-stone-700/30"
            >
              Xem tất cả thông báo →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const NAV_LINKS = [
  { label: 'Trang chủ', to: '/home' },
  { label: 'Bảng xếp hạng', to: '/bang-xep-hang' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  function handleSearchNavigate(storyId) {
    router.push('/story/' + storyId)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    setDropdownOpen(false)
    router.push('/home')
  }

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || '?'

  return (
    <nav className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 bg-amber-500 rounded-xl group-hover:bg-amber-400 transition-colors">
              <span className="text-white"><BookIcon /></span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TruyệnHay</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === link.to
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <SearchBox onNavigate={handleSearchNavigate} />
            {user && <NotificationBell router={router} />}
            {user ? (
              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-stone-700/60 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {avatarLetter}
                  </div>
                  <span className="hidden sm:block text-stone-200 text-sm font-medium max-w-28 truncate">
                    {user.name}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Always mounted — visibility controlled by CSS for smooth transition */}
                <div
                  className={`absolute right-0 top-full pt-2 w-56 z-50 transition-all duration-200 ease-out origin-top-right
                    ${dropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                    }`}
                >
                  <div className="bg-stone-800/95 backdrop-blur-sm border border-stone-700/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden ring-1 ring-white/5">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-stone-700/60 bg-stone-900/40">
                      <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-stone-400 text-xs truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-700/50 text-sm transition-colors duration-150"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Trang cá nhân
                      </Link>
                      <Link
                        href="/tu-truyen"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-700/50 text-sm transition-colors duration-150"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Tủ truyện
                      </Link>
                      <Link
                        href="/truyen-cua-toi"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-700/50 text-sm transition-colors duration-150"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Truyện của tôi
                      </Link>
                    </div>

                    <div className="py-1 border-t border-stone-700/60">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors duration-150"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-stone-300 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-stone-700/60"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700/60 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-700/50 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${pathname === link.to
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
