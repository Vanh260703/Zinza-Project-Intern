"use client";

import { Mail, User, Venus, Shield } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

function Field({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-stone-500 text-xs font-medium flex items-center gap-1.5">
        {icon}{label}
      </span>
      <span className="text-stone-200 text-sm bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5">
        {value}
      </span>
    </div>
  );
}

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

export default function ProfileFields() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <p className="text-stone-500 text-sm">Chưa đăng nhập.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Họ tên" value={user.name} icon={<User className="w-3.5 h-3.5" />} />
      <Field label="Email" value={user.email} icon={<Mail className="w-3.5 h-3.5" />} />
      <Field label="Giới tính" value={GENDER_LABEL[user.gender] ?? user.gender} icon={<Venus className="w-3.5 h-3.5" />} />
      <Field label="Vai trò" value={user.role === "admin" ? "Quản trị viên" : "Thành viên"} icon={<Shield className="w-3.5 h-3.5" />} />
    </div>
  );
}
