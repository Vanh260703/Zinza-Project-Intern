"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User, Bell, BookMarked, CreditCard, LogOut,
  BookOpenText, PlusCircle, BarChart2, Upload,
  DollarSign
} from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { useRouter } from "next/navigation";

type NavItem = { href: string; icon: React.ElementType; label: string };

const MEMBER_ITEMS: NavItem[] = [
  { href: "/profile",               icon: User,       label: "Hồ sơ cá nhân" },
  { href: "/profile/notifications", icon: Bell,       label: "Thông báo" },
  { href: "/profile/library",       icon: BookMarked, label: "Tủ truyện" },
];

const STORY_ITEMS: NavItem[] = [
  { href: "/my-novels",        icon: BookOpenText, label: "Đã đăng" },
  { href: "/my-novels/create",    icon: PlusCircle,   label: "Đăng truyện mới" },
  { href: "/my-novels/import", icon: Upload,       label: "Import ZIP" },
  { href: "/my-novels/stats",  icon: BarChart2,    label: "Thống kê" },
];

const MORE_ITEMS: NavItem[] = [
  { href: "/profile/payment",  icon: DollarSign, label: "Nạp kẹo" },
  { href: "/profile/transactions",  icon: CreditCard, label: "Lịch sử giao dịch" },
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
  const clearLibrary = useLibraryStore((s) => s.clear);

  const handleLogout = () => {
    logout();
    clearLibrary();
    router.push("/");
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        {/* User info */}
        <div className="flex flex-col items-center gap-3 px-6 py-6 border-b border-stone-800">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
            <span className="text-2xl font-bold text-amber-400">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-base leading-snug">{user?.name ?? "Người dùng"}</p>
            <p className="text-stone-500 text-xs mt-0.5">#{user?.id?.slice(0, 8) ?? "--------"}</p>
          </div>
        </div>

        {/* Nav groups */}
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

        {/* Logout */}
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
    </aside>
  );
}
