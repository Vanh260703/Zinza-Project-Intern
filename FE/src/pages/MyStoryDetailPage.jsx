import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

const GRADIENTS = [
  ['#f59e0b','#ef4444'],['#8b5cf6','#3b82f6'],['#10b981','#0891b2'],
  ['#f97316','#eab308'],['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],
  ['#14b8a6','#22c55e'],['#3b82f6','#06b6d4'],['#a855f7','#ec4899'],
]

/* ── Toast ───────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([])
  function push(type, message) {
    const id = Date.now()
    setToasts((p) => [...p, { id, type, message }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000)
  }
  return { toasts, push }
}
function ToastList({ toasts }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-fade-in-up
          ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
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

/* ── Cover image uploader (reused from MyStoriesPage) ─────────── */
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
            <span className="text-stone-600 text-xs text-center">Ảnh bìa 3:4</span>
          </div>
        )}
        {value && (
          <button onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition-colors">
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

/* ── Edit story modal ────────────────────────────────────────── */
function EditStoryModal({ story, genres, userEmail, onClose, onSaved }) {
  const [cover, setCover] = useState(story.cover)
  const [title, setTitle] = useState(story.title)
  const [author, setAuthor] = useState(story.author)
  const [genre, setGenre] = useState(story.genre || genres[0] || '')
  const [description, setDescription] = useState(story.description)
  const [status, setStatus] = useState(story.status)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setErr('Vui lòng nhập tên truyện.'); return }
    setErr('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/mock/my-story-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, id: story.id, title, author, genre, description, cover, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onSaved(data.story)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title="Chỉnh sửa thông tin" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-6">
          <CoverUpload value={cover} onChange={setCover} />
          <div className="flex-1 flex flex-col gap-3">
            <Field label="Tên truyện" required>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} placeholder="Tên truyện..." />
            </Field>
            <Field label="Tác giả">
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className={INPUT} placeholder="Tên tác giả..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Thể loại">
                <select value={genre} onChange={(e) => setGenre(e.target.value)} className={INPUT}>
                  {genres.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Trạng thái">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT}>
                  <option value="Đang viết">Đang viết</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>
              </Field>
            </div>
          </div>
        </div>
        <Field label="Giới thiệu">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            className={INPUT + ' resize-none'} placeholder="Tóm tắt nội dung..." />
        </Field>
        {err && <p className="text-red-400 text-xs">{err}</p>}
        <ModalFooter onClose={onClose} submitLabel={submitting ? 'Đang lưu...' : 'Lưu thay đổi'} disabled={submitting} />
      </form>
    </ModalShell>
  )
}

/* ── Add chapter modal ───────────────────────────────────────── */
function AddChapterModal({ story, nextNumber, userEmail, canSetVip, onClose, onAdded }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [candyPrice, setCandyPrice] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) { setErr('Vui lòng nhập nội dung chương.'); return }
    setErr('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/mock/my-story-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, storyId: story.id, title: title || `Chương ${nextNumber}`, content, candyPrice: parseInt(candyPrice) || 0 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onAdded(data.chapter)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title={`Đăng chương ${nextNumber}`} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tiêu đề chương">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT}
            placeholder={`Chương ${nextNumber} (để trống sẽ dùng tên mặc định)`} />
        </Field>
        <Field label="Nội dung" required>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12}
            className={INPUT + ' resize-none font-mono text-sm leading-relaxed'}
            placeholder="Viết nội dung chương tại đây..." />
        </Field>
        {canSetVip && (
          <Field label="Giá mở khoá chương">
            <div className="relative max-w-44">
              <input
                type="text" inputMode="numeric"
                value={candyPrice}
                onChange={(e) => setCandyPrice(e.target.value.replace(/\D/g, ''))}
                className={INPUT + ' pr-12'}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🍬</span>
            </div>
            <p className="text-stone-600 text-xs mt-1">Để 0 nếu chương này miễn phí</p>
          </Field>
        )}
        {err && <p className="text-red-400 text-xs">{err}</p>}
        <ModalFooter onClose={onClose} submitLabel={submitting ? 'Đang đăng...' : 'Đăng chương'} disabled={submitting} />
      </form>
    </ModalShell>
  )
}

/* ── Delete confirm modal ────────────────────────────────────── */
function DeleteConfirmModal({ storyTitle, onClose, onConfirm, submitting }) {
  return (
    <ModalShell title="Xóa truyện" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold mb-1">Xóa truyện này?</p>
          <p className="text-stone-400 text-sm">
            <span className="text-amber-400 font-medium">"{storyTitle}"</span> và toàn bộ chương sẽ bị xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex gap-3 w-full pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm rounded-xl transition-colors">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
            {submitting ? 'Đang xóa...' : 'Xóa truyện'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ── Shared UI helpers ───────────────────────────────────────── */
const INPUT = 'w-full bg-stone-800 border border-stone-700 focus:border-amber-500 text-stone-100 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-stone-400 text-xs font-medium mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

function ModalShell({ title, onClose, wide, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-xl'} bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 shrink-0">
          <h2 className="text-white font-bold text-base">{title}</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function ModalFooter({ onClose, submitLabel, disabled }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-1">
      <button type="button" onClick={onClose} className="px-4 py-2 text-stone-400 hover:text-stone-200 text-sm transition-colors">
        Hủy
      </button>
      <button type="submit" disabled={disabled}
        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
        {submitLabel}
      </button>
    </div>
  )
}

/* ── Stat card ───────────────────────────────────────────────── */
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-stone-500 text-xs">{label}</p>
        <p className="text-white text-xl font-bold leading-tight">{value?.toLocaleString() ?? 0}</p>
      </div>
    </div>
  )
}

/* ── Chapter row ─────────────────────────────────────────────── */
function ChapterRow({ chapter, user, canSetVip, onDelete, onPriceChanged }) {
  const [editing, setEditing] = useState(false)
  const [priceVal, setPriceVal] = useState(String(chapter.candyPrice ?? 0))
  const [saving, setSaving] = useState(false)

  async function savePrice() {
    const p = Math.max(0, parseInt(priceVal) || 0)
    setSaving(true)
    try {
      const res = await fetch('/api/mock/my-chapter-price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, storyId: chapter.storyId, chapterId: chapter.id, candyPrice: p }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onPriceChanged(chapter.id, data.candyPrice)
      setEditing(false)
    } catch { /* silently ignore */ }
    finally { setSaving(false) }
  }

  return (
    <div className="group flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-stone-800/50 transition-colors">
      <span className="w-16 text-stone-600 text-xs font-mono shrink-0">Ch.{String(chapter.number).padStart(3,'0')}</span>
      <p className="flex-1 text-stone-200 text-sm truncate">{chapter.title}</p>

      {/* Price badge */}
      {(chapter.candyPrice ?? 0) > 0 && (
        <span className="shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/25">
          🔒 {chapter.candyPrice} 🍬
        </span>
      )}

      <span className="text-stone-600 text-xs shrink-0">{chapter.publishedAt}</span>

      {/* Inline price editor — visible on hover for VIP-eligible authors */}
      {canSetVip && (
        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {editing ? (
            <>
              <input
                type="text" inputMode="numeric"
                value={priceVal}
                onChange={(e) => setPriceVal(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditing(false) }}
                className="w-14 bg-stone-700 border border-stone-600 focus:border-amber-500 text-stone-100 text-xs rounded-lg px-2 py-1 outline-none"
                placeholder="0"
                autoFocus
              />
              <span className="text-stone-500 text-xs">🍬</span>
              <button onClick={savePrice} disabled={saving}
                className="text-emerald-400 hover:text-emerald-300 text-xs px-1 transition-colors font-bold">
                {saving ? '…' : '✓'}
              </button>
              <button onClick={() => setEditing(false)}
                className="text-stone-500 hover:text-stone-300 text-xs px-1 transition-colors">✕</button>
            </>
          ) : (
            <button
              onClick={() => { setPriceVal(String(chapter.candyPrice ?? 0)); setEditing(true) }}
              className="p-1 text-stone-600 hover:text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors"
              title="Đặt giá kẹo cho chương"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => onDelete(chapter.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-stone-600 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-500/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

/* ── Manage dropdown ─────────────────────────────────────────── */
function ManageDropdown({ onEdit, onAddChapter, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const items = [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
      label: 'Chỉnh sửa thông tin',
      onClick: () => { setOpen(false); onEdit() },
      cls: 'text-stone-300 hover:text-white hover:bg-stone-700/60',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
      label: 'Đăng chương mới',
      onClick: () => { setOpen(false); onAddChapter() },
      cls: 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
      label: 'Xóa truyện',
      onClick: () => { setOpen(false); onDelete() },
      cls: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
      separator: true,
    },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-600 text-stone-200 text-sm font-medium rounded-xl transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Quản lý
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-stone-800 border border-stone-700 rounded-xl shadow-2xl overflow-hidden z-30">
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && <div className="border-t border-stone-700 my-1" />}
              <button
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${item.cls}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  {item.icon}
                </svg>
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────── */
export default function MyStoryDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toasts, push } = useToast()

  const [story, setStory] = useState(null)
  const [chapters, setChapters] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(null) // 'edit' | 'chapter' | 'delete'
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch(`/api/mock/my-stories?email=${encodeURIComponent(user.email)}`).then((r) => r.json()),
      fetch(`/api/mock/my-story-chapters?storyId=${id}`).then((r) => r.json()),
      fetch('/api/mock/genres').then((r) => r.json()),
    ]).then(([storiesData, chaptersData, genresData]) => {
      const found = (storiesData.stories ?? []).find((s) => s.id === id)
      if (!found) { navigate('/truyen-cua-toi'); return }
      setStory(found)
      setChapters(chaptersData.chapters ?? [])
      setGenres(genresData.genres ?? [])
    }).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.email])

  function handlePriceChanged(chapterId, candyPrice) {
    setChapters((prev) => prev.map((c) => c.id === chapterId ? { ...c, candyPrice } : c))
  }

  async function handleDeleteChapter(chapterId) {
    await fetch(`/api/mock/my-story-chapters?email=${encodeURIComponent(user.email)}&storyId=${id}&chapterId=${chapterId}`, { method: 'DELETE' })
    setChapters((prev) => {
      const next = prev.filter((c) => c.id !== chapterId)
      next.forEach((c, i) => { c.number = i + 1 })
      return next
    })
    setStory((prev) => ({ ...prev, chaptersCount: (prev.chaptersCount ?? 1) - 1 }))
    push('success', 'Đã xóa chương.')
  }

  async function handleDeleteStory() {
    setDeleting(true)
    await fetch(`/api/mock/my-stories?email=${encodeURIComponent(user.email)}&id=${id}`, { method: 'DELETE' })
    navigate('/truyen-cua-toi')
  }

  function handleSaved(updated) {
    setStory(updated)
    setModal(null)
    push('success', 'Đã lưu thay đổi.')
  }

  function handleChapterAdded(chapter) {
    setChapters((prev) => [chapter, ...prev])
    setStory((prev) => ({ ...prev, chaptersCount: (prev.chaptersCount ?? 0) + 1 }))
    setModal(null)
    push('success', `Đã đăng ${chapter.title}.`)
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
          <div className="h-8 w-48 bg-stone-800 rounded-xl animate-pulse" />
          <div className="flex gap-8">
            <div className="w-40 bg-stone-800 rounded-xl animate-pulse" style={{ aspectRatio: '3/4' }} />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-7 bg-stone-800 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-stone-800 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-stone-800 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!story) return null

  const [from, to] = GRADIENTS[parseInt(story.id, 10) % GRADIENTS.length]

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between mb-8 gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <Link to="/truyen-cua-toi" className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Truyện của tôi
            </Link>
            <span className="text-stone-700 shrink-0">/</span>
            <span className="text-stone-300 truncate">{story.title}</span>
          </div>
          <ManageDropdown
            onEdit={() => setModal('edit')}
            onAddChapter={() => setModal('chapter')}
            onDelete={() => setModal('delete')}
          />
        </div>

        {/* Story info */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
          {/* Cover */}
          <div className="shrink-0 w-32 sm:w-36 lg:w-44 self-center sm:self-start">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-stone-700" style={{ aspectRatio: '3/4' }}>
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
              {story.cover && (
                <img src={story.cover} alt={story.title} className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }} />
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-start gap-3 flex-wrap mb-2">
              <h1 className="text-white text-xl sm:text-2xl font-bold leading-snug">{story.title}</h1>
              {story.fromZip && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-1 shrink-0">ZIP</span>
              )}
            </div>
            {story.author && <p className="text-stone-400 text-sm mb-3">{story.author}</p>}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {story.genre && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-300">{story.genre}</span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                ${story.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : story.status === 'Tạm dừng' ? 'bg-stone-700 text-stone-400 border border-stone-600'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {story.status}
              </span>
              <span className="text-stone-600 text-xs">Đăng từ {story.createdAt}</span>
            </div>
            {story.description && (
              <p className="text-stone-400 text-sm leading-relaxed line-clamp-4">{story.description}</p>
            )}

            {/* VIP chapter info — shown only when user has >= 1000 followers */}
            {(user?.followers ?? 0) >= 1000 && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
                <span className="text-amber-400 text-sm shrink-0">👑</span>
                <p className="text-amber-400/80 text-xs leading-relaxed">
                  Bạn có thể đặt giá kẹo cho từng chương riêng lẻ. Hover vào chương trong danh sách bên dưới để chỉnh giá.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Lượt đọc"
            value={story.views}
            color="bg-blue-500/15"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          />
          <StatCard
            label="Lượt theo dõi"
            value={story.followers}
            color="bg-pink-500/15"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          />
          <StatCard
            label="Số chương"
            value={story.chaptersCount}
            color="bg-violet-500/15"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard
            label="Kẹo nhận được"
            value={story.candyEarned}
            color="bg-amber-500/15"
            icon={<span className="text-xl leading-none">🍬</span>}
          />
        </div>

        {/* Chapters */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" />
              </svg>
              Danh sách chương
              <span className="text-stone-600 text-sm font-normal">({story.chaptersCount ?? 0})</span>
            </h2>
            <button
              onClick={() => setModal('chapter')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Đăng chương
            </button>
          </div>

          {chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-stone-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-stone-500 text-sm">Chưa có chương nào.</p>
              <button onClick={() => setModal('chapter')} className="text-amber-400 hover:text-amber-300 text-sm mt-2 transition-colors">
                Đăng chương đầu tiên →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-800/60">
              {chapters.map((c) => (
                <ChapterRow
                  key={c.id}
                  chapter={c}
                  user={user}
                  canSetVip={(user?.followers ?? 0) >= 1000}
                  onDelete={handleDeleteChapter}
                  onPriceChanged={handlePriceChanged}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'edit' && (
        <EditStoryModal
          story={story}
          genres={genres}
          userEmail={user.email}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {modal === 'chapter' && (
        <AddChapterModal
          story={story}
          nextNumber={(story.chaptersCount ?? 0) + 1}
          userEmail={user.email}
          canSetVip={(user?.followers ?? 0) >= 1000}
          onClose={() => setModal(null)}
          onAdded={handleChapterAdded}
        />
      )}
      {modal === 'delete' && (
        <DeleteConfirmModal
          storyTitle={story.title}
          submitting={deleting}
          onClose={() => setModal(null)}
          onConfirm={handleDeleteStory}
        />
      )}

      <ToastList toasts={toasts} />
    </div>
  )
}
