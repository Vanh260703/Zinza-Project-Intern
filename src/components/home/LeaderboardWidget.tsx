function SkeletonRankRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="w-5 h-4 bg-stone-800 rounded animate-pulse shrink-0" />
      <div className="flex-1 h-3 bg-stone-800 rounded animate-pulse" />
      <div className="w-10 h-3 bg-stone-800 rounded animate-pulse shrink-0" />
    </div>
  );
}

const TABS = ["Ngày", "Tuần", "Tháng"];

export default function LeaderboardWidget() {
  return (
    <div className="bg-stone-900 border border-stone-700/80 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-stone-800">
        <span className="text-base">🏆</span>
        <h3 className="text-white text-sm font-bold flex-1">Bảng xếp hạng</h3>
      </div>

      <div className="flex border-b border-stone-800">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              i === 0
                ? "text-amber-400 border-b-2 border-amber-500 -mb-px bg-amber-500/5"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-2 space-y-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRankRow key={i} />
        ))}
      </div>

      <p className="text-center text-stone-700 text-xs py-2.5">
        Dữ liệu cập nhật theo mock
      </p>
    </div>
  );
}
