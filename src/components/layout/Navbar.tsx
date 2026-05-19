"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, Menu } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/home", label: "Trang chủ" },
  { href: "/bang-xep-hang", label: "Bảng xếp hạng" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group">
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
                  ${pathname === link.href
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-stone-300 hover:text-white hover:bg-stone-700/60"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search bar — desktop only */}
            <div className="relative hidden md:block">
              <div className="flex items-center gap-2 bg-stone-800/70 border border-stone-700 rounded-xl px-3 py-2 transition-all w-52 focus-within:w-72 focus-within:border-amber-500/60">
                <Search className="w-4 h-4 shrink-0 text-stone-500" strokeWidth={2} />
                <input
                  placeholder="Tìm truyện, tác giả..."
                  className="bg-transparent text-stone-200 text-sm placeholder-stone-500 outline-none w-full"
                />
              </div>
            </div>

            {/* Auth buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-stone-300 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-stone-700/60"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Đăng ký
              </Link>
            </div>

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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${pathname === link.href
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-stone-300 hover:text-white hover:bg-stone-700/60"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-2">
              <Link href="/login" className="flex-1 text-center py-2 text-sm text-stone-300 border border-stone-700 rounded-lg hover:border-stone-600 transition-colors">
                Đăng nhập
              </Link>
              <Link href="/register" className="flex-1 text-center py-2 text-sm text-white font-semibold bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors">
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
