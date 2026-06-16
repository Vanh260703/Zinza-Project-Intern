"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Menu,
  Bell,
  ChevronDown,
  User,
  BookMarked,
  LogOut,
  BookOpenText,
  ShieldCheck,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useLibraryStore } from "@/stores/libraryStore";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/novels/vip", label: "👑 VIP" },
];

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  author: string;
  poster: string | null;
  genres: { slug: string; name: string }[];
};

function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Hủy debounce timer khi component unmount — tránh fetch sau khi navigate đi
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchResults = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setRemaining(0);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/novels/search?q=${encodeURIComponent(value)}&limit=4`);
      const data = await res.json();
      setResults(data.results);
      setRemaining(data.total - data.results.length);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && q.trim()) {
      setOpen(false);
      router.push(`/novels?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <div className="flex items-center gap-2 bg-stone-800/70 border border-stone-700 rounded-xl px-4 py-2 transition-all w-52 focus-within:w-72 focus-within:border-amber-500/60">
        <Search className="w-4 h-4 shrink-0 text-stone-500" strokeWidth={2} />
        <input
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => q.trim() && results.length > 0 && setOpen(true)}
          placeholder="Tìm truyện, tác giả..."
          className="bg-transparent text-stone-200 text-sm placeholder-stone-500 outline-none w-full"
          autoComplete="off"
        />
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-stone-600 border-t-amber-500 rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {open && q.trim() && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-stone-900 border border-stone-700/80 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="px-4 py-4 text-stone-500 text-sm text-center">
              Không tìm thấy kết quả
            </div>
          ) : (
            <>
              {results.map((story) => (
                <Link
                  key={story.id}
                  href={`/novels/${story.slug}`}
                  onClick={() => {
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-800 transition-colors"
                >
                  <div className="w-8 h-10 rounded-md overflow-hidden bg-stone-800 shrink-0">
                    {story.poster ? (
                      <img
                        src={`/api/cover/${story.id}`}
                        alt={story.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-700 flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-stone-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-200 text-sm font-medium truncate">{story.name}</p>
                    <p className="text-stone-500 text-xs truncate">{story.author}</p>
                  </div>
                  {story.genres[0] && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-stone-700 text-stone-400 rounded-md shrink-0">
                      {story.genres[0].name}
                    </span>
                  )}
                </Link>
              ))}

              {remaining > 0 && (
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push(`/novels?q=${encodeURIComponent(q.trim())}`);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-stone-800 transition-colors border-t border-stone-800 text-center font-medium"
                >
                  Còn {remaining} truyện nữa →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string | Date): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d === 1) return "hôm qua";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

type NotificationItem = {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

function NotificationDropdown() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !user) return;
    fetch(`/api/notifications?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.notifications);
        setTotalUnread(d.totalUnread);
      });
  }, [open, user]);

  // Số unread trong 4 items đang hiển thị
  const shownUnread = items.filter((n) => !n.isRead).length;
  const remainingUnread = totalUnread - shownUnread;

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setTotalUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700/60 transition-colors"
      >
        <Bell className="w-5 h-5" strokeWidth={1.8} />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-80 bg-stone-900 border border-stone-700/80
          rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50
          transition-all duration-200 origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
          <span className="text-white text-sm font-semibold">Thông báo</span>
          {totalUnread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        {/* List */}
        {items.length === 0 ? (
          <div className="px-4 py-8 text-stone-500 text-sm text-center">Không có thông báo nào</div>
        ) : (
          <div>
            {items.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-stone-800/60 last:border-0 hover:bg-stone-800/50 transition-colors cursor-default
                  ${!n.isRead ? "bg-amber-500/5" : ""}`}
              >
                <div className="flex items-start gap-2.5">
                  {!n.isRead && (
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  )}
                  <div className={`flex-1 min-w-0 ${n.isRead ? "pl-4" : ""}`}>
                    <p className="text-stone-200 text-xs font-medium leading-snug truncate">
                      {n.title}
                    </p>
                    <p className="text-stone-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                      {n.content}
                    </p>
                    <p className="text-stone-600 text-[10px] mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {remainingUnread > 0 && (
          <Link
            href="/profile/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-stone-800 transition-colors border-t border-stone-800 text-center font-medium"
          >
            Còn {remainingUnread} thông báo chưa đọc →
          </Link>
        )}
        {remainingUnread === 0 && items.length > 0 && (
          <Link
            href="/profile/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-xs text-stone-500 hover:text-stone-400 hover:bg-stone-800 transition-colors border-t border-stone-800 text-center"
          >
            Xem tất cả thông báo
          </Link>
        )}
      </div>
    </div>
  );
}

function UserDropdown() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const clearLibrary = useLibraryStore((state) => state.clear);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    clearLibrary();
    router.push("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-200
          hover:bg-stone-700/60 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <span className="text-amber-400 text-xs font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block max-w-28 truncate">{user?.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-52 bg-stone-900 border border-stone-700/80
          rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50
          transition-all duration-200 origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
      >
        <div className="px-4 py-3 border-b border-stone-800">
          <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
          <p className="text-stone-500 text-xs truncate">{user?.email}</p>
        </div>

        <div className="p-1.5 space-y-0.5">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-400
                hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Trang quản lý
            </Link>
          )}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-300
              hover:text-white hover:bg-stone-800 transition-colors"
          >
            <User className="w-4 h-4" />
            Trang cá nhân
          </Link>
          <Link
            href={`/users/${user?.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-300
              hover:text-white hover:bg-stone-800 transition-colors"
          >
            <User className="w-4 h-4" />
            Hồ sơ công khai
          </Link>
          <Link
            href="/profile/library"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-300
              hover:text-white hover:bg-stone-800 transition-colors"
          >
            <BookMarked className="w-4 h-4" />
            Tủ sách
          </Link>
          <Link
            href="/my-novels"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-300
              hover:text-white hover:bg-stone-800 transition-colors"
          >
            <BookOpenText className="w-4 h-4" />
            Truyện của tôi
          </Link>
        </div>

        <div className="p-1.5 border-t border-stone-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400
              hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileQ, setMobileQ] = useState("");

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileQ.trim()) return;
    setMenuOpen(false);
    setMobileQ("");
    router.push(`/novels?q=${encodeURIComponent(mobileQ.trim())}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 bg-amber-500 rounded-xl group-hover:bg-amber-400 transition-colors">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TruyệnHay</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    pathname === link.href
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-stone-300 hover:text-white hover:bg-stone-700/60"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    pathname.startsWith("/admin")
                      ? "text-violet-400 bg-violet-500/10"
                      : "text-violet-400/70 hover:text-violet-300 hover:bg-violet-500/10"
                  }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Quản lý
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <SearchBox />

            {user ? (
              <>
                {/* Notification — hiện trên cả mobile lẫn desktop */}
                <NotificationDropdown />
                {/* UserDropdown — chỉ desktop */}
                <div className="hidden sm:flex items-center gap-1">
                  <UserDropdown />
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-stone-300 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-stone-700/60"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700/60 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-800 py-3 space-y-1">
            {/* Search bar */}
            <form onSubmit={handleMobileSearch} className="px-2 pb-2">
              <div className="flex items-center gap-2 bg-stone-800/70 border border-stone-700 rounded-xl px-4 py-2.5 focus-within:border-amber-500/60 transition-colors">
                <Search className="w-4 h-4 shrink-0 text-stone-500" />
                <input
                  value={mobileQ}
                  onChange={(e) => setMobileQ(e.target.value)}
                  placeholder="Tìm truyện, tác giả..."
                  className="bg-transparent text-stone-200 text-sm placeholder-stone-500 outline-none w-full"
                  autoComplete="off"
                />
              </div>
            </form>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    pathname === link.href
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-stone-300 hover:text-white hover:bg-stone-700/60"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="flex flex-col gap-1 pt-1 border-t border-stone-800 mt-1">
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-violet-400 hover:bg-violet-500/10 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Trang quản lý
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-700/60 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Hồ sơ cá nhân
                </Link>
                <Link
                  href={`/users/${user?.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-700/60 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Hồ sơ công khai
                </Link>
                <Link
                  href="/profile/library"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-700/60 transition-colors"
                >
                  <BookMarked className="w-4 h-4" />
                  Tủ sách
                </Link>
                <Link
                  href="/my-novels"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-700/60 transition-colors"
                >
                  <BookOpenText className="w-4 h-4" />
                  Truyện của tôi
                </Link>
              </div>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center py-2 text-sm text-stone-300 border border-stone-700 rounded-lg hover:border-stone-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 text-center py-2 text-sm text-white font-semibold bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
