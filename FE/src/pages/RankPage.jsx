'use client'
import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'

const TABS = [
  { key: 'reader',  label: 'Đọc giả tích cực',    icon: '📖', unit: 'chương',  color: 'from-sky-500 to-blue-600' },
  { key: 'spender', label: 'Chi kẹo nhiều nhất',   icon: '🍬', unit: 'kẹo',    color: 'from-amber-500 to-orange-600' },
  { key: 'topup',   label: 'Nạp kẹo nhiều nhất',   icon: '💎', unit: 'kẹo',    color: 'from-emerald-500 to-teal-600' },
  { key: 'author',  label: 'Tác giả tích cực',      icon: '✍️', unit: 'truyện', color: 'from-violet-500 to-purple-600' },
]

const AVATAR_GRADIENTS = [
  ['#f59e0b', '#ef4444'], ['#8b5cf6', '#3b82f6'], ['#10b981', '#0891b2'],
  ['#f97316', '#eab308'], ['#6366f1', '#8b5cf6'], ['#ec4899', '#f43f5e'],
  ['#14b8a6', '#22c55e'], ['#3b82f6', '#06b6d4'], ['#a855f7', '#ec4899'],
  ['#f59e0b', '#84cc16'],
]

const MEDALS = ['🥇', '🥈', '🥉']

const MEDAL_RING = [
  'border-amber-400/60 shadow-amber-500/20',
  'border-stone-400/60 shadow-stone-400/20',
  'border-amber-700/60 shadow-amber-700/20',
]

const MEDAL_BG = [
  'bg-amber-500/10',
  'bg-stone-500/10',
  'bg-amber-700/10',
]

function avatarGradient(name = '') {
  const code = name.charCodeAt(0) || 0
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length]
}

function Avatar({ name, size = 'md' }) {
  const [from, to] = avatarGradient(name)
  const cls = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-lg`}
      style={{ background: `linear-gradient(135deg,${from},${to})` }}
    >
      {(name?.[0] ?? '?').toUpperCase()}
    </div>
  )
}

function TopThreeCard({ rank, entry, unit, tabColor }) {
  const idx = rank - 1
  return (
    <div className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 ${MEDAL_RING[idx]} ${MEDAL_BG[idx]} shadow-lg transition-transform hover:-translate-y-0.5`}>
      <span className="absolute -top-4 text-3xl">{MEDALS[idx]}</span>
      <Avatar name={entry.name} size="lg" />
      <div className="text-center min-w-0 w-full">
        <p className="text-white font-semibold text-sm line-clamp-1">{entry.name}</p>
        <p className={`mt-1 text-lg font-extrabold bg-gradient-to-r ${tabColor} bg-clip-text text-transparent`}>
          {entry.score.toLocaleString()}
        </p>
        <p className="text-stone-500 text-xs">{unit}</p>
      </div>
    </div>
  )
}

function RankRow({ rank, entry, max, unit }) {
  const pct = max > 0 ? Math.round((entry.score / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-colors">
      <span className="text-stone-500 font-mono text-sm w-5 text-right shrink-0">{rank}</span>
      <Avatar name={entry.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-stone-200 text-sm font-medium line-clamp-1">{entry.name}</p>
          <span className="text-stone-400 text-sm font-semibold shrink-0">
            {entry.score.toLocaleString()} <span className="text-stone-600 font-normal text-xs">{unit}</span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-stone-800 bg-stone-900/50 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-stone-800" />
      <div className="space-y-2 w-full">
        <div className="h-3 bg-stone-800 rounded mx-auto w-3/4" />
        <div className="h-5 bg-stone-800 rounded mx-auto w-1/2" />
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-stone-900 animate-pulse">
      <div className="w-5 h-4 bg-stone-800 rounded" />
      <div className="w-9 h-9 rounded-full bg-stone-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-stone-800 rounded w-2/5" />
        <div className="h-1.5 bg-stone-800 rounded w-full" />
      </div>
    </div>
  )
}

export default function RankPage() {
  const [activeTab, setActiveTab] = useState('reader')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  const tab = TABS.find((t) => t.key === activeTab)

  useEffect(() => {
    if (data[activeTab]) return
    setLoading(true)
    fetch(`/api/mock/rankings?type=${activeTab}&limit=10`)
      .then((r) => r.json())
      .then((res) => setData((prev) => ({ ...prev, [activeTab]: res.rankings ?? [] })))
      .finally(() => setLoading(false))
  }, [activeTab])

  const rows = data[activeTab] ?? []
  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)
  const maxScore = rows[0]?.score ?? 1

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center text-[20rem] leading-none">🏆</div>
        <div className="relative max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
            🏆 Bảng xếp hạng
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Những người đóng góp</h1>
          <p className="text-stone-500 text-sm">Tôn vinh độc giả &amp; tác giả tích cực nhất trên nền tảng</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Tab pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeTab === t.key
                  ? `bg-gradient-to-r ${t.color} text-white shadow-lg`
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-6 mt-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : top3.map((entry, i) => (
                <TopThreeCard
                  key={entry.key}
                  rank={i + 1}
                  entry={entry}
                  unit={tab.unit}
                  tabColor={tab.color}
                />
              ))}
        </div>

        {/* Remaining rows */}
        {rest.length > 0 || loading ? (
          <div className="space-y-2">
            <p className="text-stone-600 text-xs font-medium uppercase tracking-widest mb-3 px-1">Tiếp theo</p>
            {loading
              ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
              : rest.map((entry, i) => (
                  <RankRow
                    key={entry.key}
                    rank={i + 4}
                    entry={entry}
                    max={maxScore}
                    unit={tab.unit}
                  />
                ))}
          </div>
        ) : null}

        {!loading && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">📭</span>
            <p className="text-stone-500 text-sm">Chưa có dữ liệu cho hạng mục này</p>
          </div>
        )}
      </div>
    </div>
  )
}
