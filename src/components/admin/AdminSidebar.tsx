"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, BookOpenText, ShieldCheck, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useLibraryStore } from "@/stores/libraryStore";

type NavItem = { href: string; icon: React.ElementType; label: string; exact?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",        icon: LayoutDashboard, label: "Tổng quan",      exact: true },
  { href: "/admin/users",  icon: Users,           label: "Người dùng" },
  { href: "/admin/novels", icon: BookOpenText,    label: "Tất cả truyện" },
];

function NavLink({ href, icon: Icon, label, exact, pathname }: NavItem & { pathname: string }) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
          : "text-stone-400 hover:text-white hover:bg-stone-800"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname     = usePathname();
  const router       = useRouter();
  const { user, logout } = useAuthStore();
  const clearLibrary = useLibraryStore((s) => s.clear);

  const handleLogout = () => { logout(); clearLibrary(); router.push("/"); };

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden sticky top-8">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-stone-800">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Admin Panel</p>
            <p className="text-stone-600 text-[11px]">{user?.email}</p>
          </div>
        </div>

        <nav className="p-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
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
    </aside>
  );
}
