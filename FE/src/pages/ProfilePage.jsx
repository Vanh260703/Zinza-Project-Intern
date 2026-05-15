'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

/* ─── Icons ──────────────────────────────────────────────────────────── */
const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)
const EyeIcon = ({ open }) => (
  <Icon className="w-5 h-5" d={open
    ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
    : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
  } />
)
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

/* ─── Sidebar ─────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'profile', label: 'Hồ sơ', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { key: 'notifications', label: 'Thông báo', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { key: 'bookshelf', label: 'Tủ truyện', d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { key: 'topup', label: 'Nạp kẹo', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'transactions', label: 'Lịch sử giao dịch', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
]

function Sidebar({ active, onChange }) {
  return (
    <aside className="w-full lg:w-60 lg:shrink-0">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="lg:hidden flex gap-1 overflow-x-auto bg-stone-900 rounded-2xl border border-stone-800 p-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0
              ${active === tab.key
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
          >
            <Icon d={tab.d} className="w-3.5 h-3.5 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>
      {/* Desktop: vertical nav */}
      <nav className="hidden lg:block bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        <div className="px-4 py-5 border-b border-stone-800">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Tài khoản</p>
        </div>
        <ul className="p-2">
          {TABS.map((tab) => (
            <li key={tab.key}>
              <button
                onClick={() => onChange(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${active === tab.key
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
              >
                <Icon d={tab.d} className="w-4.5 h-4.5 shrink-0" />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

/* ─── Profile tab ─────────────────────────────────────────────────────── */
function Toast({ type, message }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm
      ${type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
        : 'bg-red-500/15 border border-red-500/30 text-red-400'}`}>
      <Icon className="w-4 h-4 shrink-0" d={type === 'success'
        ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        : 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
      } />
      {message}
    </div>
  )
}

function ProfileTab() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef(null)

  // Avatar stored per-user in localStorage
  const avatarKey = `avatar_${user?.email}`
  const [avatar, setAvatar] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem(avatarKey) : null) || null)

  const [name, setName] = useState(user?.name || '')
  const [gender, setGender] = useState(user?.gender || '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameToast, setNameToast] = useState(null)

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwToast, setPwToast] = useState(null)

  function showToast(setter, type, message) {
    setter({ type, message })
    setTimeout(() => setter(null), 3500)
  }

  /* Avatar upload */
  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      localStorage.setItem(avatarKey, dataUrl)
      setAvatar(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  /* Update name + gender */
  async function handleSaveName(e) {
    e.preventDefault()
    const nameChanged = name.trim() !== user?.name
    const genderChanged = gender !== user?.gender
    if (!name.trim()) { showToast(setNameToast, 'error', 'Tên hiển thị không được để trống.'); return }
    if (name.trim().length < 2) { showToast(setNameToast, 'error', 'Tên hiển thị phải có ít nhất 2 ký tự.'); return }
    if (!nameChanged && !genderChanged) return
    setNameLoading(true)
    try {
      const res = await fetch('/api/mock/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: name.trim(), gender }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      updateUser({ name: data.user.name, gender: data.user.gender })
      showToast(setNameToast, 'success', 'Cập nhật thông tin thành công!')
    } catch (err) {
      showToast(setNameToast, 'error', err.message)
    } finally {
      setNameLoading(false)
    }
  }

  /* Change password */
  function validatePw(form) {
    const e = {}
    if (!form.current) e.current = 'Vui lòng nhập mật khẩu hiện tại.'
    if (!form.next) e.next = 'Vui lòng nhập mật khẩu mới.'
    else if (form.next.length < 6) e.next = 'Mật khẩu mới phải có ít nhất 6 ký tự.'
    if (!form.confirm) e.confirm = 'Vui lòng xác nhận mật khẩu mới.'
    else if (form.confirm !== form.next) e.confirm = 'Mật khẩu xác nhận không khớp.'
    return e
  }

  async function handleChangePw(e) {
    e.preventDefault()
    const errs = validatePw(pwForm)
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwLoading(true)
    setPwErrors({})
    try {
      const res = await fetch('/api/mock/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPwForm({ current: '', next: '', confirm: '' })
      showToast(setPwToast, 'success', 'Đổi mật khẩu thành công!')
    } catch (err) {
      if (err.message.includes('hiện tại')) {
        setPwErrors({ current: err.message })
      } else {
        showToast(setPwToast, 'error', err.message)
      }
    } finally {
      setPwLoading(false)
    }
  }

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || '?'
  const inputBase = 'w-full bg-stone-800 border text-stone-100 text-sm rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-stone-600'
  const inputNormal = `${inputBase} border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20`
  const inputError = `${inputBase} border-red-500/60 focus:ring-2 focus:ring-red-500/20`
  const inputDisabled = `${inputBase} border-stone-700/50 text-stone-500 cursor-not-allowed`

  return (
    <div className="space-y-8">

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 rounded-2xl border border-stone-800 px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl shrink-0">🍬</div>
          <div>
            <p className="text-stone-500 text-xs mb-0.5">Số kẹo hiện có</p>
            <p className="text-white text-2xl font-bold">{(user?.candy ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-stone-900 rounded-2xl border border-stone-800 px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl shrink-0">📖</div>
          <div>
            <p className="text-stone-500 text-xs mb-0.5">Chương đã đọc</p>
            <p className="text-white text-2xl font-bold">{(user?.chaptersRead ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-stone-900 rounded-2xl border border-stone-800 px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center text-xl shrink-0">👥</div>
          <div className="flex-1 min-w-0">
            <p className="text-stone-500 text-xs mb-0.5">Người theo dõi</p>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white text-2xl font-bold">{(user?.followers ?? 0).toLocaleString()}</p>
              {(user?.followers ?? 0) >= 1000 && (
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-medium">
                  👑 VIP
                </span>
              )}
            </div>
            {(user?.followers ?? 0) < 1000 && (
              <p className="text-stone-600 text-xs mt-0.5">{1000 - (user?.followers ?? 0)} nữa để mở VIP</p>
            )}
          </div>
        </div>
      </div>

      {/* VIP unlock banner */}
      {(user?.followers ?? 0) >= 1000 && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <span className="text-xl shrink-0">👑</span>
          <div>
            <p className="text-amber-300 text-sm font-semibold mb-0.5">Tính năng VIP đã được mở khoá!</p>
            <p className="text-amber-400/70 text-xs leading-relaxed">
              Bạn đã đạt <span className="font-bold text-amber-400">{(user?.followers ?? 0).toLocaleString()}</span> người theo dõi.
              Vào <span className="font-semibold">Truyện của tôi</span> để đưa truyện vào danh sách VIP.
            </p>
          </div>
        </div>
      )}

      {/* Avatar + basic info */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
        <h3 className="text-white font-semibold mb-5">Thông tin cơ bản</h3>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-stone-800">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/40">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white text-3xl font-bold">{avatarLetter}</div>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" className="w-5 h-5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-stone-500 text-sm">{user?.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Thay đổi ảnh đại diện
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* Email - readonly */}
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1.5">
              Email <span className="text-stone-600 font-normal text-xs">(không thể thay đổi)</span>
            </label>
            <input value={user?.email || ''} readOnly className={inputDisabled} />
          </div>

          {/* Gender - editable */}
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1.5">Giới tính</label>
            <div className="flex gap-2">
              {[{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }, { value: 'other', label: 'Khác' }].map((g) => (
                <label
                  key={g.value}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg border text-sm cursor-pointer transition-all select-none
                    ${gender === g.value
                      ? 'border-amber-500/60 bg-amber-500/15 text-amber-400 font-medium'
                      : 'border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300'
                    }`}
                >
                  <input type="radio" name="gender" value={g.value} checked={gender === g.value} onChange={() => setGender(g.value)} className="sr-only" />
                  {g.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
        <h3 className="text-white font-semibold mb-5">Thông tin cá nhân</h3>
        <form onSubmit={handleSaveName}>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên hiển thị"
                className={inputNormal}
              />
            </div>
            <button
              type="submit"
              disabled={nameLoading || !name.trim() || name.trim() === user?.name}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0"
            >
              {nameLoading ? <><Spinner />Đang lưu...</> : 'Lưu thay đổi'}
            </button>
          </div>
          {nameToast && <div className="mt-3"><Toast {...nameToast} /></div>}
        </form>
      </div>

      {/* Change password */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
        <h3 className="text-white font-semibold mb-5">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePw} className="space-y-4">
          {(['current', 'next', 'confirm']).map((field) => {
            const labels = { current: 'Mật khẩu hiện tại', next: 'Mật khẩu mới', confirm: 'Xác nhận mật khẩu mới' }
            const placeholders = { current: 'Nhập mật khẩu hiện tại', next: 'Tối thiểu 6 ký tự', confirm: 'Nhập lại mật khẩu mới' }
            return (
              <div key={field}>
                <label className="block text-sm font-medium text-stone-400 mb-1.5">{labels[field]}</label>
                <div className="relative">
                  <input
                    type={pwShow[field] ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={(e) => {
                      setPwForm((p) => ({ ...p, [field]: e.target.value }))
                      if (pwErrors[field]) setPwErrors((p) => ({ ...p, [field]: '' }))
                    }}
                    placeholder={placeholders[field]}
                    disabled={pwLoading}
                    className={`${pwErrors[field] ? inputError : inputNormal} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow((p) => ({ ...p, [field]: !p[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                    tabIndex={-1}
                  >
                    <EyeIcon open={pwShow[field]} />
                  </button>
                </div>
                {pwErrors[field] && <p className="text-red-400 text-xs mt-1.5">{pwErrors[field]}</p>}
              </div>
            )
          })}
          {pwToast && <Toast {...pwToast} />}
          <button
            type="submit"
            disabled={pwLoading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            {pwLoading ? <><Spinner />Đang cập nhật...</> : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── Bookshelf tab ───────────────────────────────────────────────────── */
const GRADIENTS = [
  ['#f59e0b','#ef4444'],['#8b5cf6','#3b82f6'],['#10b981','#0891b2'],
  ['#f97316','#eab308'],['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],
  ['#14b8a6','#22c55e'],['#3b82f6','#06b6d4'],['#a855f7','#ec4899'],
  ['#f59e0b','#84cc16'],['#ef4444','#f97316'],['#0ea5e9','#6366f1'],
]

function BookshelfTab() {
  const { user, toggleBookmark } = useAuth()
  const router = useRouter()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  const bookmarkIds = user?.bookmark ?? []

  useEffect(() => {
    if (!bookmarkIds.length) { setLoading(false); return }
    fetch('/api/mock/stories?limit=40')
      .then((r) => r.json())
      .then((data) => {
        const all = data.stories ?? []
        setStories(all.filter((s) => bookmarkIds.includes(s.id)))
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync list when bookmark changes (remove story immediately on unfollow)
  const displayed = stories.filter((s) => bookmarkIds.includes(s.id))

  if (loading) {
    return (
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-16 h-22 rounded-xl bg-stone-800 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-stone-800 rounded w-3/4" />
                <div className="h-3 bg-stone-800 rounded w-1/2" />
                <div className="h-3 bg-stone-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!displayed.length) {
    return (
      <div className="bg-stone-900 rounded-2xl border border-stone-800 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center text-3xl mb-4">📚</div>
        <h3 className="text-white font-semibold mb-2">Tủ truyện trống</h3>
        <p className="text-stone-500 text-sm mb-5">Theo dõi truyện để lưu vào tủ của bạn</p>
        <button
          onClick={() => router.push('/home')}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Khám phá truyện
        </button>
      </div>
    )
  }

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold">Tủ truyện</h3>
        <span className="text-stone-500 text-sm">{displayed.length} truyện</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayed.map((s) => {
          const [from, to] = GRADIENTS[s.gradient % GRADIENTS.length]
          return (
            <div
              key={s.id}
              className="group flex gap-4 p-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-all"
            >
              {/* Poster */}
              <div
                className="w-14 shrink-0 rounded-lg overflow-hidden cursor-pointer relative"
                style={{ aspectRatio: '3/4' }}
                onClick={() => router.push('/story/' + s.id)}
              >
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
                {s.poster && (
                  <img
                    src={s.poster}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <p
                    className="text-stone-100 text-sm font-semibold line-clamp-1 cursor-pointer group-hover:text-amber-400 transition-colors"
                    onClick={() => router.push('/story/' + s.id)}
                  >
                    {s.title}
                  </p>
                  <p className="text-stone-500 text-xs mt-0.5">{s.author}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${s.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {s.status === 'Hoàn thành' ? 'Full' : 'Đang ra'}
                    </span>
                    <span className="text-stone-600 text-xs">{s.totalChapters?.toLocaleString()} chương</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-stone-400 text-xs">{s.rating}</span>
                  </div>
                  <button
                    onClick={() => toggleBookmark(s.id)}
                    className="text-xs text-stone-500 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Bỏ theo dõi
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Top-up tab ─────────────────────────────────────────────────────── */
const PACKAGES = [
  { vnd: 10_000,  candy: 10,  bonus: 0 },
  { vnd: 20_000,  candy: 22,  bonus: 2 },
  { vnd: 50_000,  candy: 60,  bonus: 10 },
  { vnd: 100_000, candy: 130, bonus: 30 },
  { vnd: 200_000, candy: 280, bonus: 80 },
  { vnd: 500_000, candy: 750, bonus: 250 },
]

function TopUpTab() {
  const { user, updateUser } = useAuth()
  const [selected, setSelected] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [timer, setTimer] = useState(15 * 60)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  function startTimer() {
    setTimer(15 * 60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  function handleSelectPackage(pkg) {
    setSelected(pkg)
    setConfirmed(false)
    setToast(null)
    setShowQR(true)
    startTimer()
  }

  function handleClose() {
    setShowQR(false)
    clearInterval(timerRef.current)
  }

  async function handleConfirm() {
    if (!selected || !user) return
    setLoading(true)
    try {
      const res = await fetch('/api/mock/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, candy: selected.candy, vnd: selected.vnd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      updateUser({ candy: data.candy })
      setConfirmed(true)
      clearInterval(timerRef.current)
      setToast({ type: 'success', message: `Nạp thành công ${selected.candy} kẹo!` })
      setTimeout(() => { setShowQR(false); setToast(null) }, 2500)
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const mins = String(Math.floor(timer / 60)).padStart(2, '0')
  const secs = String(timer % 60).padStart(2, '0')
  const expired = timer === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl shrink-0">🍬</div>
          <div>
            <h3 className="text-white font-semibold">Nạp kẹo</h3>
            <p className="text-stone-500 text-xs">Chọn gói nạp phù hợp với bạn</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <span className="text-amber-400 text-sm">Số kẹo hiện có:</span>
          <span className="text-amber-300 text-lg font-bold ml-1">{(user?.candy ?? 0).toLocaleString()} 🍬</span>
        </div>
      </div>

      {/* Packages grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.vnd}
            onClick={() => handleSelectPackage(pkg)}
            className="relative bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-4 text-left transition-all group hover:bg-stone-800/80"
          >
            {pkg.bonus > 0 && (
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                +{pkg.bonus}
              </div>
            )}
            <p className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
              {pkg.candy} 🍬
            </p>
            <p className="text-stone-400 text-sm mt-1 font-medium">
              {pkg.vnd.toLocaleString('vi-VN')}đ
            </p>
            {pkg.bonus > 0 && (
              <p className="text-amber-500 text-xs mt-1">Ưu đãi thêm {pkg.bonus} kẹo</p>
            )}
          </button>
        ))}
      </div>

      {/* QR Modal */}
      {showQR && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-sm relative animate-fade-in-up">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <Icon d="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
            </button>

            <h3 className="text-white font-semibold text-center mb-1">Quét mã QR để thanh toán</h3>
            <p className="text-stone-500 text-xs text-center mb-4">
              Chuyển khoản{' '}
              <span className="text-amber-400 font-semibold">{selected.vnd.toLocaleString('vi-VN')}đ</span>
              {' '}để nhận{' '}
              <span className="text-amber-400 font-semibold">{selected.candy} 🍬</span>
            </p>

            {/* QR image */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-xl">
                <img
                  src="/api/mock/fake-qr"
                  alt="QR code"
                  className="w-44 h-44 object-cover rounded"
                />
              </div>
            </div>

            {/* Bank info */}
            <div className="bg-stone-800 rounded-xl p-3 mb-4 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Ngân hàng</span>
                <span className="text-stone-200 font-medium">VCB – Vietcombank</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Số tài khoản</span>
                <span className="text-stone-200 font-medium font-mono">1234 5678 90</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Số tiền</span>
                <span className="text-amber-400 font-bold">{selected.vnd.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-stone-500 shrink-0">Nội dung</span>
                <span className="text-stone-200 font-mono text-right">NAP {user?.email?.split('@')[0].toUpperCase()}</span>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center justify-center gap-2 mb-4 py-2 rounded-xl text-sm font-semibold
              ${expired ? 'bg-red-500/10 text-red-400' : 'bg-stone-800 text-stone-300'}`}
            >
              <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />
              {expired ? 'Hết thời gian – vui lòng thử lại' : `Còn lại ${mins}:${secs}`}
            </div>

            {toast && <div className="mb-3"><Toast {...toast} /></div>}

            {!confirmed && !expired && (
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner />Đang xử lý...</> : 'Tôi đã chuyển tiền'}
              </button>
            )}

            {expired && (
              <button
                onClick={handleClose}
                className="w-full py-2.5 border border-stone-700 hover:border-stone-600 text-stone-400 hover:text-stone-300 text-sm rounded-xl transition-all"
              >
                Chọn gói khác
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Transactions tab ────────────────────────────────────────────────── */
const TX_CONFIG = {
  topup:    { icon: '💎', label: 'Nạp kẹo',   badge: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' },
  purchase: { icon: '🔓', label: 'Mở chương', badge: 'bg-amber-500/15 border-amber-500/20 text-amber-400' },
  gift:     { icon: '🎁', label: 'Tặng kẹo',  badge: 'bg-rose-500/15 border-rose-500/20 text-rose-400' },
}

function TransactionsTab() {
  const { user } = useAuth()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch(`/api/mock/transactions?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => setTxs(data.transactions ?? []))
      .finally(() => setLoading(false))
  }, [user?.email])

  if (loading) {
    return (
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!txs.length) {
    return (
      <div className="bg-stone-900 rounded-2xl border border-stone-800 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center text-3xl mb-4">💳</div>
        <h3 className="text-white font-semibold mb-2">Chưa có giao dịch nào</h3>
        <p className="text-stone-500 text-sm">Các giao dịch kẹo sẽ hiện thị tại đây</p>
      </div>
    )
  }

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold">Lịch sử giao dịch</h3>
        <span className="text-stone-500 text-sm">{txs.length} giao dịch</span>
      </div>
      <div className="space-y-2">
        {txs.map((tx) => {
          const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.gift
          const isPositive = tx.candyChange > 0
          const sign = isPositive ? '+' : ''
          const dateStr = new Date(tx.date).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-stone-800/50 hover:bg-stone-800/80 transition-colors border border-transparent hover:border-stone-700/50"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border ${cfg.badge}`}>
                {cfg.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-stone-100 text-sm font-medium line-clamp-1">{tx.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <span className="text-stone-600 text-xs">{dateStr}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {sign}{tx.candyChange.toLocaleString()} 🍬
                </p>
                <p className="text-stone-600 text-xs mt-0.5 tabular-nums">
                  Còn: {(tx.candyAfter ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Placeholder tabs ────────────────────────────────────────────────── */
function PlaceholderTab({ icon, title, description }) {
  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center text-3xl mb-4">{icon}</div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-stone-500 text-sm">{description}</p>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile')

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Trang cá nhân</h1>
          <p className="text-stone-500 text-sm mt-1">Quản lý thông tin và cài đặt tài khoản của bạn</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Sidebar active={activeTab} onChange={setActiveTab} />

          <main className="flex-1 min-w-0 w-full">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'notifications' && (
              <PlaceholderTab icon="🔔" title="Thông báo" description="Bạn chưa có thông báo nào." />
            )}
            {activeTab === 'bookshelf' && <BookshelfTab />}
            {activeTab === 'topup' && <TopUpTab />}
            {activeTab === 'transactions' && <TransactionsTab />}
          </main>
        </div>
      </div>
    </div>
  )
}
