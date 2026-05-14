import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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

const NAV_LINKS = [
  { label: 'Trang chủ', to: '/home' },
  { label: 'Thể loại', to: '/the-loai' },
  { label: 'Bảng xếp hạng', to: '/bang-xep-hang' },
  { label: 'Mới cập nhật', to: '/moi-cap-nhat' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  function handleSearchNavigate(storyId) {
    navigate('/story/' + storyId)
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
    navigate('/login')
  }

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || '?'

  return (
    <nav className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 group">
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
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === link.to
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
            {user ? (
              <div className="relative" ref={dropdownRef}>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-stone-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-stone-800 border border-stone-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-stone-700">
                      <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-stone-400 text-xs truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-700/60 text-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Trang cá nhân
                      </Link>
                      <Link
                        to="/tu-truyen"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-700/60 text-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Tủ truyện
                      </Link>
                    </div>
                    <div className="py-1 border-t border-stone-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-stone-300 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-stone-700/60"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
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
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === link.to
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
