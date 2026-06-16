"use client";

import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/userStore";
import { GENRES } from "@/config/genres";
import { STATUS_OPTIONS } from "@/enums/story";

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-800 border border-stone-700 hover:border-stone-600 focus:border-amber-500 text-stone-200 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors appearance-none cursor-pointer pr-8"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown className="w-4 h-4 text-stone-500" />
      </div>
    </div>
  );
}

export default function HeroSection() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (genre) params.set("genre", genre);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    router.push(`/novels?${params.toString()}`);
  };

  return (
    <div className="relative bg-linear-to-br from-stone-900 via-amber-950/30 to-stone-900 border-b border-stone-800">
      {/* Decorative glows */}
      <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute right-24 bottom-0 w-64 h-64 rounded-full bg-orange-500/5 blur-2xl pointer-events-none" />

      {/* Headline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-medium">
              Hơn 10,000 truyện đang chờ bạn
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 sm:mb-4">
            Kho truyện chữ
            <br />
            <span className="text-amber-400">hàng đầu</span> Việt Nam
          </h1>

          <p className="text-stone-400 text-sm sm:text-base mb-5 sm:mb-7 leading-relaxed">
            Khám phá hàng nghìn bộ truyện tiên hiệp, huyền huyễn, võ hiệp được cập nhật mỗi ngày.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              Khám phá ngay
            </Link>
            {(!mounted || !user) && (
              <Link
                href="/auth/register"
                className="px-6 py-2.5 border border-stone-600 hover:border-stone-500 text-stone-300 hover:text-amber-400 font-semibold rounded-xl text-sm transition-colors"
              >
                Đăng ký miễn phí
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search / filter bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <form
          onSubmit={handleSearch}
          className="relative z-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 bg-stone-900/80 backdrop-blur-sm border border-stone-700/60 rounded-2xl px-4 py-3"
        >
          <div className="relative w-full sm:flex-1 sm:min-w-44">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Search className="w-4 h-4 text-stone-500" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tên truyện hoặc tác giả..."
              className="w-full bg-stone-800 border border-stone-700 hover:border-stone-600 focus:border-amber-500 text-stone-200 text-sm rounded-xl px-3 py-2.5 outline-none transition-colors pl-9"
            />
          </div>

          <div className="grid grid-cols-3 sm:contents gap-2">
            <FilterSelect value={genre} onChange={setGenre}>
              <option value="">Thể loại</option>
              {GENRES.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect value={status} onChange={setStatus}>
              <option value="">Trạng thái</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect value={sort} onChange={setSort}>
              <option value="latest">⚡ Mới nhất</option>
              <option value="views">👁 Lượt xem</option>
              <option value="rating">⭐ Đánh giá</option>
            </FilterSelect>
          </div>

          <div className="flex items-center gap-1.5 sm:shrink-0">
            <button
              type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-amber-500/20"
            >
              <Search className="w-4 h-4" strokeWidth={2.5} />
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
