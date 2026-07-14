"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Bell,
  BookMarked,
  CreditCard,
  LogOut,
  BookOpenText,
  PlusCircle,
  BarChart2,
  Upload,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";

type NavItem = { href: string; icon: React.ElementType; label: string };

const MEMBER_ITEMS: NavItem[] = [
  { href: "/profile", icon: User, label: "Hồ sơ cá nhân" },
  { href: "/profile/notifications", icon: Bell, label: "Thông báo" },
  { href: "/profile/library", icon: BookMarked, label: "Tủ truyện" },
];

const STORY_ITEMS: NavItem[] = [
  { href: "/my-novels", icon: BookOpenText, label: "Đã đăng" },
  { href: "/my-novels/create", icon: PlusCircle, label: "Đăng truyện mới" },
  { href: "/my-novels/import", icon: Upload, label: "Import ZIP" },
  { href: "/my-novels/stats", icon: BarChart2, label: "Thống kê" },
];

const MORE_ITEMS: NavItem[] = [
  { href: "/profile/payment", icon: DollarSign, label: "Nạp kẹo" },
  { href: "/profile/transactions", icon: CreditCard, label: "Lịch sử giao dịch" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-stone-600">
      {children}
    </p>
  );
}

function NavLink({ href, icon: Icon, label, pathname }: NavItem & { pathname: string }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
          : "text-stone-400 hover:text-white hover:bg-stone-800"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        {/* User info — luôn hiện, toggle chỉ xuất hiện dưới lg */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="lg:hidden w-full flex items-center gap-3 px-4 py-4 hover:bg-stone-800/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center shrink-0">
            <span className="text-base font-bold text-amber-400">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {user?.name ?? "Người dùng"}
            </p>
            <p className="text-stone-500 text-xs">#{user?.id?.slice(0, 8) ?? "--------"}</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {/* Desktop: user info dạng dọc như cũ */}
        <div className="hidden lg:flex flex-col items-center gap-3 px-6 py-6 border-b border-stone-800">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
            <span className="text-2xl font-bold text-amber-400">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-base leading-snug">
              {user?.name ?? "Người dùng"}
            </p>
            <p className="text-stone-500 text-xs mt-0.5">#{user?.id?.slice(0, 8) ?? "--------"}</p>
          </div>
        </div>

        {/* Nav + Logout — desktop luôn hiện, mobile/tablet chỉ hiện khi expanded */}
        <div className={`${expanded ? "block" : "hidden"} lg:block`}>
          {/* Mobile: divider */}
          <div className="lg:hidden border-t border-stone-800" />

          <nav className="p-2">
            <SectionLabel>Thành viên</SectionLabel>
            {MEMBER_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}

            <SectionLabel>Truyện của tôi</SectionLabel>
            {STORY_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}

            <SectionLabel>Làm thêm</SectionLabel>
            {MORE_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}
          </nav>

          <div className="p-2 border-t border-stone-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
