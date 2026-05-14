const GRADIENTS = [
  ['#f59e0b', '#ef4444'],
  ['#8b5cf6', '#3b82f6'],
  ['#10b981', '#0891b2'],
  ['#f97316', '#eab308'],
  ['#6366f1', '#8b5cf6'],
  ['#ec4899', '#f43f5e'],
  ['#14b8a6', '#22c55e'],
  ['#3b82f6', '#06b6d4'],
  ['#a855f7', '#ec4899'],
  ['#f59e0b', '#84cc16'],
  ['#ef4444', '#f97316'],
  ['#0ea5e9', '#6366f1'],
]

function formatViews(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'tr'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k'
  return n.toString()
}

export default function StoryCard({ story }) {
  const [from, to] = GRADIENTS[story.gradient % GRADIENTS.length]

  return (
    <div className="group flex-shrink-0 w-full cursor-pointer">
      {/* Cover */}
      <div className="relative rounded-xl overflow-hidden aspect-[3/4] mb-3">
        <div
          className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        />
        {/* Title overlay on cover */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 bg-linear-to-t from-black/70 via-black/10 to-transparent">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
            {story.title}
          </p>
        </div>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full
            ${story.status === 'Hoàn thành'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-amber-500/90 text-white'
            }`}>
            {story.status === 'Hoàn thành' ? 'Full' : 'Đang ra'}
          </span>
        </div>
        {/* First letter big */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity">
          <span className="text-white font-black" style={{ fontSize: '5rem', lineHeight: 1 }}>
            {story.title.charAt(0)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-stone-100 text-sm font-semibold line-clamp-1 group-hover:text-amber-400 transition-colors">
          {story.title}
        </h3>
        <p className="text-stone-500 text-xs">{story.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-stone-500 text-xs">{story.chapters} chương</span>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-stone-400 text-xs">{story.rating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
