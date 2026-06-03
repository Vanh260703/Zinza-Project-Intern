import { Eye, BookOpen, Candy, User, Tag, Calendar } from "lucide-react";
import type { Story } from "@/types/story";

const stats = [
  { key: "views", label: "LƯỢT ĐỌC", icon: Eye, color: "text-blue-400", value: 0 },
  {
    key: "chapters",
    label: "CHƯƠNG ĐÃ ĐĂNG",
    icon: BookOpen,
    color: "text-emerald-400",
    value: null,
  },
  { key: "candy", label: "KẸO NHẬN ĐƯỢC", icon: Candy, color: "text-amber-400", value: 0 },
];

function formatDate(date?: Date | string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export default function InfoTab({ story }: { story: Story }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ key, label, icon: Icon, color, value }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-2 py-5 px-3 bg-stone-800/50 border border-stone-800 rounded-xl"
          >
            <Icon className={`w-5 h-5 ${color}`} strokeWidth={1.8} />
            <p className="text-white text-xl font-bold">
              {key === "chapters"
                ? story.chapterCount.toLocaleString()
                : (value ?? 0).toLocaleString()}
            </p>
            <p className="text-stone-600 text-[10px] font-semibold tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Chi tiết */}
      <div className="flex flex-col gap-4 p-5 bg-stone-800/30 border border-stone-800 rounded-xl">
        <p className="text-amber-400 text-sm font-semibold">Chi tiết</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-stone-500 text-xs">Tác giả</p>
            <p className="text-stone-200 text-sm flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-500" />
              {story.author}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-stone-500 text-xs">Thể loại</p>
            <div className="flex flex-wrap gap-1.5">
              {story.genres.map((g) => (
                <span
                  key={g.slug}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 bg-stone-800 border border-stone-700 text-stone-300 rounded-md"
                >
                  <Tag className="w-2.5 h-2.5 text-stone-500" />
                  {g.name}
                </span>
              ))}
              {story.genres.length === 0 && <span className="text-stone-600 text-xs">—</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-stone-500 text-xs">Ngày đăng</p>
            <p className="text-stone-200 text-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              {formatDate(story.updatedAt)}
            </p>
          </div>
        </div>

        {story.description && (
          <>
            <hr className="border-stone-800" />
            <div className="flex flex-col gap-2">
              <p className="text-stone-500 text-xs">Tóm tắt</p>
              <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                {story.description}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
