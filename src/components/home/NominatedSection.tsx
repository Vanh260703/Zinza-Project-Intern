"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import SectionHeader from "./SectionHeader";

export default function NominatedSection() {
  const user = useUserStore((state) => state.user);

  return (
    <section>
      <SectionHeader icon="⭐" title="Truyện đề cử" />

      {user ? (
        // TODO: hiện danh sách truyện đề cử cho user
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-stone-400 text-sm">
            Xin chào, <span className="text-amber-400 font-medium">{user.name}</span>!
            Truyện đề cử sẽ hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-stone-600" strokeWidth={1.5} />
          </div>
          <p className="text-stone-400 text-sm font-medium mb-1">Chưa có dữ liệu</p>
          <p className="text-stone-600 text-xs mb-5">
            Đăng nhập để xem truyện được đề cử dành riêng cho bạn
          </p>
          <Link
            href="/login"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </section>
  );
}
