import Link from "next/link";
import { BookOpen, BookOpenText, CalendarDays } from "lucide-react";
import type { User } from "@/types/user";
import type { Story } from "@/types/story";

function formatJoinedAt(joinedAt?: string) {
  if (!joinedAt) return "Không rõ";
  return new Date(joinedAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/novels/${story.slug}`}
      className="flex gap-3 p-3 rounded-xl border border-stone-800 hover:border-stone-700 hover:bg-stone-800/50 transition-colors group"
    >
      <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-800 shrink-0">
        {story.poster ? (
          <img
            src={`/api/cover/${story.id}`}
            alt={story.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-stone-600" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 min-w-0 justify-center">
        <p className="text-stone-200 text-sm font-medium truncate group-hover:text-amber-400 transition-colors">
          {story.name}
        </p>
        <p className="text-stone-500 text-xs">{story.chapterCount} chương</p>
        <div className="flex gap-1.5 flex-wrap mt-0.5">
          {story.genres.slice(0, 2).map((g) => (
            <span key={g} className="text-[10px] px-1.5 py-0.5 bg-stone-700 text-stone-400 rounded-md">
              {g}
            </span>
          ))}
          {story.vip && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-md">VIP</span>
          )}
        </div>
      </div>
    </Link>
  );
}

type Props = { user: User; stories: Story[] };

export default function PublicProfile({ user, stories }: Props) {
  return (
    <div className="min-h-screen bg-stone-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">

        {/* Avatar + info */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-amber-400">
              {user.name[0].toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-center sm:text-left flex-1">
            <div className="flex items-start justify-center sm:justify-between gap-2">
              <div>
                <h1 className="text-white text-xl font-bold">{user.name}</h1>
                <p className="text-stone-500 text-xs mt-0.5">#{user.id.slice(0, 8)}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${
                user.role === "admin"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-stone-800 border-stone-700 text-stone-400"
              }`}>
                {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-stone-500 text-xs">
              <CalendarDays className="w-3.5 h-3.5" />
              Tham gia {formatJoinedAt(user.joinedAt)}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-stone-500 text-xs">Chương đã đọc</p>
            <p className="text-white text-2xl font-bold">{user.chaptersRead.toLocaleString()}</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-stone-500 text-xs">Truyện đã đăng</p>
            <p className="text-white text-2xl font-bold">{stories.length}</p>
          </div>
        </div>

        {/* Posted stories */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookOpenText className="w-4 h-4 text-amber-400" />
            <h2 className="text-white font-semibold">Truyện đã đăng</h2>
          </div>

          {stories.length === 0 ? (
            <p className="text-stone-600 text-sm py-6 text-center">Chưa đăng truyện nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
