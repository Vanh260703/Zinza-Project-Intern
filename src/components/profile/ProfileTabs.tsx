"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import { Mail, User, Venus, Shield, Camera, Lock, Image, KeyRound } from "lucide-react";
import { showToast } from "@/lib/toast";

// ── THÔNG TIN tab ─────────────────────────────────────────────────────────────

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-stone-500 text-xs font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-stone-200 text-sm bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5">
        {value}
      </span>
    </div>
  );
}

function InfoTab() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);

  if (!user) return <p className="text-stone-500 text-sm">Chưa đăng nhập.</p>;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.message ?? "Cập nhật thất bại");
        return;
      }
      setUser(data.user, useAuthStore.getState().token ?? "");
      showToast.success("Đã lưu thay đổi");
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Read-only fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Email"
          value={user.email}
          icon={<Mail className="w-3.5 h-3.5" />}
        />
        <Field
          label="Giới tính"
          value={GENDER_LABEL[user.gender] ?? user.gender}
          icon={<Venus className="w-3.5 h-3.5" />}
        />
        <Field
          label="Vai trò"
          value={user.role === "admin" ? "Quản trị viên" : "Thành viên"}
          icon={<Shield className="w-3.5 h-3.5" />}
        />
      </div>

      <hr className="border-stone-800" />

      {/* Editable display name */}
      <div className="flex flex-col gap-3 max-w-sm">
        <label className="text-stone-400 text-xs font-medium flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Tên hiển thị
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors"
          placeholder="Nhập tên hiển thị..."
        />
        <button
          onClick={handleSave}
          disabled={loading || !name.trim() || name === user.name}
          className="self-start px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

// ── ẢNH ĐẠI DIỆN tab ─────────────────────────────────────────────────────────

function AvatarTab() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
          <span className="text-4xl font-bold text-amber-400">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </span>
        </div>
        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center hover:bg-stone-600 transition-colors">
          <Camera className="w-4 h-4 text-stone-300" />
        </button>
      </div>
      <p className="text-stone-500 text-sm text-center max-w-xs">
        Tải lên ảnh đại diện. Ảnh JPG hoặc PNG, tối đa 2MB.
      </p>
      <button className="px-5 py-2 rounded-xl text-sm font-semibold border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors">
        Chọn ảnh
      </button>
    </div>
  );
}

// ── BẢO MẬT tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const user = useAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.message ?? "Đổi mật khẩu thất bại");
        return;
      }
      showToast.success("Đổi mật khẩu thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Mật khẩu hiện tại", value: currentPassword, onChange: setCurrentPassword },
    { label: "Mật khẩu mới",      value: newPassword,     onChange: setNewPassword },
    { label: "Xác nhận mật khẩu mới", value: confirmPassword, onChange: setConfirmPassword },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <p className="text-stone-500 text-sm">Thay đổi mật khẩu tài khoản.</p>

      {fields.map(({ label, value, onChange }) => (
        <div key={label} className="flex flex-col gap-1.5">
          <label className="text-stone-400 text-xs font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            {label}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
        className="self-start mt-1 px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
      >
        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
      </button>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

const TABS = [
  { id: "info",     label: "THÔNG TIN" , icon: User },
  { id: "avatar",   label: "ẢNH ĐẠI DIỆN" , icon: Image },
  { id: "security", label: "BẢO MẬT" , icon: KeyRound },
];

export default function ProfileTabs() {
  const [active, setActive] = useState("info");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-stone-800">
        {TABS.map(({ id, label, icon }) => {
          const Icon = icon;
          return (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`px-4 py-2.5 text-xs font-semibold tracking-wider transition-colors border-b-2 -mb-px ${
              active === id
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-stone-500 hover:text-stone-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          </button>
        )
        })}
      </div>

      {/* Tab content */}
      {active === "info"     && <InfoTab />}
      {active === "avatar"   && <AvatarTab />}
      {active === "security" && <SecurityTab />}
    </div>
  );
}
