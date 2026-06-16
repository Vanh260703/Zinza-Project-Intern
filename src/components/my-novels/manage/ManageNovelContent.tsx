"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Crown,
  ArrowLeft,
  Settings,
  PlusCircle,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { useDeleteNovel } from "@/hooks/useNovels";
import { useAuthStore } from "@/stores/userStore";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ErrorPage from "@/components/error/ErrorPage";
import type { Story } from "@/types/story";
import InfoTab from "./InfoTab";
import ChaptersTab from "./ChaptersTab";
import EditTab from "./EditTab";
import ScheduleTab from "./ScheduleTab";

import { getStoryStatus } from "@/config/statuses";

const TABS = [
  { id: "info", label: "Thông tin truyện" },
  { id: "chapters", label: "Danh sách chương" },
  { id: "schedule", label: "Lịch mở chương" },
];

function formatDate(date?: Date | string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

type Props = { story: Story };

export default function ManageNovelContent({ story: initialStory }: Props) {
  const [story, setStory] = useState(initialStory);
  const [active, setActive] = useState("info");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated() ?? false);

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist?.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  const router = useRouter();
  const status = getStoryStatus(story.status);
  const deleteMutation = useDeleteNovel();

  if (!hydrated) return null;

  if (!user || user.id !== story.postedBy) {
    return (
      <ErrorPage
        code={403}
        title="Không có quyền truy cập"
        description="Bạn không phải tác giả của truyện này."
        action={{ label: "Truyện của tôi", href: "/my-novels" }}
      />
    );
  }

  // Chưa mount → không hiện gì, tránh flash content
  if (!mounted) return null;

  // Chưa đăng nhập → redirect về login
  if (!user) {
    router.replace("/auth/login");
    return null;
  }

  // Đã đăng nhập nhưng không phải người đăng truyện → 403 full screen
  // dùng fixed inset-0 để phủ lên toàn bộ layout (kể cả ProfileSidebar)
  if (user.id !== initialStory.postedBy) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950">
        <ErrorPage
          code={403}
          title="Không có quyền truy cập"
          description="Bạn không phải người đăng truyện này."
        />
      </div>
    );
  }

  return (
    <>
      {showDelete && (
        <ConfirmModal
          title="Xóa truyện này?"
          description={`"${story.name}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
          confirmLabel="Xóa truyện"
          loading={deleteMutation.isPending}
          onConfirm={() =>
            deleteMutation.mutate(story.id, { onSuccess: () => router.push("/my-novels") })
          }
          onCancel={() => setShowDelete(false)}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* Back */}
        <Link
          href="/my-novels"
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách truyện
        </Link>

        {/* Header */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex gap-4 items-start">
            {/* Cover */}
            <div className="w-20 h-28 rounded-xl overflow-hidden bg-stone-800 shrink-0">
              {story.poster ? (
                <img
                  src={`/api/cover/${story.id}`}
                  alt={story.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-stone-600" strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Info + actions */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white font-bold text-lg leading-snug">{story.name}</h1>
                {story.vip && (
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">
                    <Crown className="w-2.5 h-2.5" />
                    VIP
                  </span>
                )}
                {status && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold tracking-wide ${status.cls}`}
                  >
                    {status.labelUpper}
                  </span>
                )}
              </div>

              {story.updatedAt && (
                <p className="text-stone-500 text-xs flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Cập nhật: {formatDate(story.updatedAt)}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap mt-1">
                <button
                  onClick={() => {
                    setShowEdit(true);
                    setActive("edit");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Cập nhật thông tin
                </button>
                <Link
                  href={`/my-novels/${story.id}/chapters/create`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Đăng chương
                </Link>
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa truyện
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-stone-800">
            {[...TABS, ...(showEdit ? [{ id: "edit", label: "Chỉnh sửa" }] : [])].map(
              ({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`px-5 py-3.5 text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    active === id
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="p-5">
            {active === "info" && <InfoTab story={story} />}
            {active === "chapters" && <ChaptersTab novelId={story.id} />}
            {active === "schedule" && <ScheduleTab />}
            {active === "edit" && (
              <EditTab
                story={story}
                onUpdated={(s) => {
                  setStory(s);
                  setActive("info");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
