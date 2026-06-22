"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Candy,
  Ticket,
  BookOpen,
  Lock,
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  Plus,
} from "lucide-react";
import Link from "next/link";
import TopupDialog from "./TopupDialog";
import type { User } from "@/types/user";
import { useAdminUserById } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/userStore";

// Admin API trả DbUser (trừ password): User + các field internal bị strip khỏi login
type UserDetail = User & {
  candy: number;
  unlockedChapters: string[];
  storiesMark: string[];
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 bg-stone-800/50 border border-stone-800 rounded-2xl">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xl font-bold text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-stone-500 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-stone-800 last:border-0">
      <span className="text-stone-500 text-sm shrink-0">{label}</span>
      <span className="text-stone-200 text-sm text-right">{value}</span>
    </div>
  );
}

export default function UserDetailContent({ userId }: { userId: string }) {
  const router = useRouter();
  const currentAdminId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [showTopup, setShowTopup] = useState(false);
  const isSelf = currentAdminId === userId;

  const {
    data: user,
    isLoading,
    isError,
  } = useAdminUserById(userId) as {
    data: UserDetail | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  if (isError) {
    router.replace("/admin/users");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleTopupSuccess = (newCandy: number) => {
    queryClient.setQueryData<UserDetail>(["admin-user", userId], (prev) =>
      prev ? { ...prev, candy: newCandy } : prev
    );
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })
      : "—";

  return (
    <>
      {showTopup && (
        <TopupDialog
          user={user}
          onClose={() => setShowTopup(false)}
          onSuccess={handleTopupSuccess}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* Back */}
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>

        {/* Header card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                {user.name[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-white font-bold text-lg sm:text-xl">{user.name}</h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                    user.role === "admin"
                      ? "text-violet-300 bg-violet-500/15 border-violet-500/25"
                      : "text-stone-400 bg-stone-800 border-stone-700"
                  }`}
                >
                  {user.role === "admin" ? "Admin" : "User"}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm text-stone-400">
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  Tham gia {formatDate(user.joinedAt)}
                </span>
                <span className="flex items-center gap-2 font-mono text-xs text-stone-600">
                  <UserIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">#{user.id}</span>
                </span>
              </div>
            </div>
          </div>
          {!isSelf && (
            <button
              onClick={() => setShowTopup(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 transition-colors self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              Nạp kẹo
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Candy}
            label="Kẹo hiện có"
            value={user.candy}
            color="bg-amber-500/15 text-amber-400"
          />
          <StatCard
            icon={Ticket}
            label="Vé tháng"
            value={user.recommendationTicket}
            color="bg-sky-500/15 text-sky-400"
          />
          <StatCard
            icon={BookOpen}
            label="Chương đã đọc"
            value={user.chaptersRead}
            color="bg-emerald-500/15 text-emerald-400"
          />
          <StatCard
            icon={Lock}
            label="Chương đã mở"
            value={user.unlockedChapters?.length ?? 0}
            color="bg-violet-500/15 text-violet-400"
          />
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-4 h-4 text-stone-500" />
              <p className="text-stone-300 font-semibold text-sm">Thông tin tài khoản</p>
            </div>
            <Row label="Tên hiển thị" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Ngày tham gia" value={formatDate(user.joinedAt)} />
            <Row label="Truyện đã lưu" value={`${user.storiesMark?.length ?? 0} truyện`} />
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <p className="text-stone-300 font-semibold text-sm">Quyền & Số dư</p>
            </div>
            <Row
              label="Role"
              value={
                <span
                  className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                    user.role === "admin"
                      ? "text-violet-300 bg-violet-500/10 border-violet-500/20"
                      : "text-stone-400 bg-stone-800 border-stone-700"
                  }`}
                >
                  {user.role}
                </span>
              }
            />
            <Row
              label="Số dư kẹo"
              value={
                <span className="text-amber-400 font-semibold">
                  {user.candy.toLocaleString()} 🍬
                </span>
              }
            />
            <Row
              label="Vé đề cử tháng"
              value={<span className="text-sky-400">{user.recommendationTicket} vé</span>}
            />
            <Row label="Chương đã mở khoá" value={`${user.unlockedChapters?.length ?? 0} chương`} />
          </div>
        </div>
      </div>
    </>
  );
}
