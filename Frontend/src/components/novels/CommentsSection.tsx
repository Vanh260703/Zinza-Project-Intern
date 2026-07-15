"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useComments";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Vừa xong";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} tháng trước`;
  return `${Math.floor(mo / 12)} năm trước`;
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-stone-700 flex items-center justify-center text-sm text-stone-300 font-semibold shrink-0">
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export default function CommentsSection({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useComments(slug);
  const createMut = useCreateComment(slug);
  const deleteMut = useDeleteComment(slug);
  const [text, setText] = useState("");

  const comments = data?.data ?? [];
  const total = data?.meta.total ?? comments.length;

  const handleSubmit = () => {
    const content = text.trim();
    if (!content) return;
    createMut.mutate(content, { onSuccess: () => setText("") });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Form gửi bình luận */}
      {user ? (
        <div className="flex gap-3">
          <Avatar name={user.name} avatarUrl={user.avatarUrl || null} />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Viết bình luận..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-600 text-sm resize-none focus:outline-none focus:border-stone-600"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || createMut.isPending}
              className="self-end px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {createMut.isPending ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-4 text-center">
          <p className="text-stone-400 text-sm">
            <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 font-medium">
              Đăng nhập
            </Link>{" "}
            để tham gia bình luận
          </p>
        </div>
      )}

      {/* Tiêu đề */}
      <h3 className="text-white font-bold text-sm">{total.toLocaleString()} bình luận</h3>

      {/* Danh sách */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-stone-600">
          <MessageSquare className="w-9 h-9 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <Avatar name={c.user.name} avatarUrl={c.user.avatarUrl} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-stone-200 text-sm font-medium">{c.user.name}</span>
                  <span className="text-stone-600 text-xs">{timeAgo(c.createdAt)}</span>
                  {user?.id === c.user.id && (
                    <button
                      onClick={() => deleteMut.mutate(c.id)}
                      disabled={deleteMut.isPending && deleteMut.variables === c.id}
                      title="Xoá bình luận"
                      className="ml-auto p-1 rounded-md text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-stone-400 text-sm mt-1 whitespace-pre-line break-words">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
