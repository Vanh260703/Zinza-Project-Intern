'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

const GRADIENTS = [
  ['#f59e0b','#ef4444'],['#8b5cf6','#3b82f6'],['#10b981','#0891b2'],
  ['#f97316','#eab308'],['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],
  ['#14b8a6','#22c55e'],['#3b82f6','#06b6d4'],['#a855f7','#ec4899'],
]

/* ── Cover image uploader ─────────────────────────────────────── */
function CoverUpload({ value, onChange }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-xl overflow-hidden border-2 border-dashed transition-colors cursor-pointer
          ${dragging ? 'border-amber-400 bg-amber-500/10' : value ? 'border-stone-600' : 'border-stone-700 hover:border-stone-500'}`}
        style={{ width: 120, aspectRatio: '3/4' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      >
        {value ? (
          <img src={value} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-stone-600 text-xs text-center leading-snug">Ảnh bìa<br/>3:4</span>
          </div>
        )}
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      <p className="text-stone-600 text-xs mt-2">Click hoặc kéo thả</p>
    </div>
  )
}

/* ── Manual form ─────────────────────────────────────────────── */
function ManualForm({ onClose, onAdded, genres, userEmail }) {
  const [cover, setCover] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState(genres[0] ?? '')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setErr('Vui lòng nhập tên truyện.'); return }
    setErr('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/mock/my-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, title, author, genre, description, cover }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onAdded(data.story)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Cover + fields */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="self-center sm:self-start">
          <CoverUpload value={cover} onChange={setCover} />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <label className="block text-stone-400 text-xs font-medium mb-1.5">Tên truyện <span className="text-red-400">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên truyện..."
              className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-stone-400 text-xs font-medium mb-1.5">Tác giả</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tên tác giả..."
              className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-stone-400 text-xs font-medium mb-1.5">Thể loại</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors"
            >
              {genres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-stone-400 text-xs font-medium mb-1.5">Giới thiệu</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tóm tắt nội dung truyện..."
          className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors resize-none placeholder:text-stone-600"
        />
      </div>

      {err && <p className="text-red-400 text-xs">{err}</p>}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button type="button" onClick={onClose} className="px-4 py-2 text-stone-400 hover:text-stone-200 text-sm transition-colors">
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {submitting ? 'Đang lưu...' : 'Thêm truyện'}
        </button>
      </div>
    </form>
  )
}

/* ── ZIP import form ─────────────────────────────────────────── */
function ZipForm({ onClose, onAdded, userEmail }) {
  const inputRef = useRef()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  function handleFile(f) {
    if (!f) return
    if (!f.name.endsWith('.zip')) { setErr('Chỉ chấp nhận file .zip'); return }
    setErr('')
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.zip$/i, '').replace(/[_-]/g, ' '))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) { setErr('Vui lòng chọn file .zip'); return }
    if (!title.trim()) { setErr('Vui lòng nhập tên truyện.'); return }
    setErr('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/mock/my-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, title: title.trim(), fromZip: file.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onAdded(data.story)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Drop zone */}
      <div
        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer
          ${dragging ? 'border-amber-400 bg-amber-500/10' : file ? 'border-emerald-600 bg-emerald-500/5' : 'border-stone-700 hover:border-stone-500'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      >
        {file ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 text-sm font-medium">{file.name}</p>
              <p className="text-stone-600 text-xs mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setTitle('') }}
              className="text-stone-500 hover:text-red-400 text-xs transition-colors"
            >
              Chọn file khác
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-stone-300 text-sm font-medium">Kéo thả hoặc click để chọn file</p>
              <p className="text-stone-600 text-xs mt-0.5">Chỉ hỗ trợ định dạng .zip</p>
            </div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".zip" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {/* Story title */}
      <div>
        <label className="block text-stone-400 text-xs font-medium mb-1.5">Tên truyện <span className="text-red-400">*</span></label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên truyện sẽ được điền tự động từ tên file..."
          className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors"
        />
      </div>

      {err && <p className="text-red-400 text-xs">{err}</p>}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button type="button" onClick={onClose} className="px-4 py-2 text-stone-400 hover:text-stone-200 text-sm transition-colors">
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting || !file}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {submitting ? 'Đang import...' : 'Import truyện'}
        </button>
      </div>
    </form>
  )
}

/* ── Add story modal ─────────────────────────────────────────── */
function AddStoryModal({ onClose, onAdded, genres, userEmail }) {
  const [tab, setTab] = useState('manual')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-white font-bold text-base">Thêm truyện mới</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          <button
            onClick={() => setTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'manual' ? 'bg-amber-500 text-white' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Thêm thủ công
          </button>
          <button
            onClick={() => setTab('zip')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'zip' ? 'bg-amber-500 text-white' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import ZIP
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          {tab === 'manual'
            ? <ManualForm onClose={onClose} onAdded={onAdded} genres={genres} userEmail={userEmail} />
            : <ZipForm onClose={onClose} onAdded={onAdded} userEmail={userEmail} />
          }
        </div>
      </div>
    </div>
  )
}

/* ── Story card ──────────────────────────────────────────────── */
function MyStoryCard({ story, index, onDelete }) {
  const router = useRouter()
  const [from, to] = GRADIENTS[index % GRADIENTS.length]
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="group bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-xl overflow-hidden transition-all cursor-pointer" onClick={() => router.push('/truyen-cua-toi/' + story.id)}>
      {/* Cover */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
        {story.cover && !imgErr && (
          <img
            src={story.cover}
            alt={story.title}
            onError={() => setImgErr(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {story.fromZip && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/80 text-white font-medium">ZIP</span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${story.status === 'Hoàn thành' ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
            {story.status === 'Hoàn thành' ? 'Full' : 'Đang viết'}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-xs font-semibold line-clamp-2 leading-snug">{story.title}</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {story.author && <p className="text-stone-500 text-xs truncate">{story.author}</p>}
        <div className="flex items-center justify-between">
          {story.genre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
              {story.genre}
            </span>
          )}
          <span className="text-stone-600 text-xs ml-auto">{story.createdAt}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────── */
export default function MyStoriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stories, setStories] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch(`/api/mock/my-stories?email=${encodeURIComponent(user.email)}`).then((r) => r.json()),
      fetch('/api/mock/genres').then((r) => r.json()),
    ]).then(([storiesData, genresData]) => {
      setStories(storiesData.stories ?? [])
      setGenres(genresData.genres ?? [])
    }).finally(() => setLoading(false))
  }, [user?.email])

  async function handleDelete(storyId) {
    await fetch(`/api/mock/my-stories?email=${encodeURIComponent(user.email)}&id=${storyId}`, { method: 'DELETE' })
    setStories((prev) => prev.filter((s) => s.id !== storyId))
  }

  function handleAdded(story) {
    setStories((prev) => [story, ...prev])
    setShowModal(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Truyện của tôi</h1>
            <p className="text-stone-500 text-sm mt-1">Quản lý truyện bạn đã đăng</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Thêm truyện
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-stone-900 overflow-hidden">
                <div className="aspect-3/4 bg-stone-800 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-stone-800 rounded animate-pulse" />
                  <div className="h-3 bg-stone-800 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-stone-800 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-stone-300 font-semibold mb-1">Bạn chưa có truyện nào</p>
            <p className="text-stone-600 text-sm mb-6">Bắt đầu bằng cách thêm truyện đầu tiên của bạn</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Thêm truyện đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stories.map((story, i) => (
              <MyStoryCard
                key={story.id}
                story={story}
                index={i}
                onDelete={() => handleDelete(story.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddStoryModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
          genres={genres}
          userEmail={user.email}
        />
      )}
    </div>
  )
}
