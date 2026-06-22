"use client";

import { useState } from "react";
import { useUpdateProfile, useChangePassword, useUploadAvatar } from "@/hooks/useUser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/userStore";
import { Mail, User, Venus, Shield, Camera, Lock, Image, KeyRound } from "lucide-react";

import { updateProfileSchema, resetPasswordSchema } from "@/schemas/auth";

// ── Shared ────────────────────────────────────────────────────────────────────

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const inputCls =
  "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors";

function Field({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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

// ── THÔNG TIN tab ─────────────────────────────────────────────────────────────

type InfoFormData = z.infer<typeof updateProfileSchema>;

function InfoTab() {
  const { user } = useAuthStore();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<InfoFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { userId: user?.id ?? "", name: user?.name ?? "" },
  });

  if (!user) return <p className="text-stone-500 text-sm">Chưa đăng nhập.</p>;

  const onSubmit = (data: InfoFormData) => updateMutation.mutate(data);

  return (
    <div className="flex flex-col gap-6">
      {/* Read-only fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" value={user.email} icon={<Mail className="w-3.5 h-3.5" />} />
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

      {/* Editable name */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-sm">
        <input type="hidden" {...register("userId")} />

        <div className="flex flex-col gap-1.5">
          <label className="text-stone-400 text-xs font-medium flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Tên hiển thị
          </label>
          <input
            {...register("name")}
            className={`${inputCls} ${errors.name ? "border-red-500/60" : ""}`}
            placeholder="Nhập tên hiển thị..."
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending || !isDirty}
          className="self-start px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}

// ── ẢNH ĐẠI DIỆN tab ─────────────────────────────────────────────────────────

function AvatarTab() {
  const user = useAuthStore((s) => s.user);
  const uploadMutation = useUploadAvatar();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Chỉ hỗ trợ JPG, PNG, WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ảnh tối đa 2MB");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    uploadMutation.mutate(file, {
      onError: () => setPreview(null),
    });
  };

  const currentAvatar = preview ?? (user?.avatarUrl ? `/api/user/avatar/${user.id}` : null);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
          {currentAvatar ? (
            <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-amber-400">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center hover:bg-stone-600 transition-colors cursor-pointer">
          <Camera className="w-4 h-4 text-stone-300" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleChange}
            disabled={uploadMutation.isPending}
          />
        </label>
      </div>

      {uploadMutation.isPending && (
        <p className="text-amber-400 text-sm">Đang tải lên...</p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <p className="text-stone-500 text-sm text-center max-w-xs">
        Tải lên ảnh đại diện. Ảnh JPG, PNG hoặc WebP, tối đa 2MB.
      </p>

      <label className={`px-5 py-2 rounded-xl text-sm font-semibold border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer ${uploadMutation.isPending ? "opacity-40 cursor-not-allowed" : ""}`}>
        {uploadMutation.isPending ? "Đang tải lên..." : "Chọn ảnh"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
          disabled={uploadMutation.isPending}
        />
      </label>
    </div>
  );
}

// ── BẢO MẬT tab ──────────────────────────────────────────────────────────────

type SecurityFormData = z.infer<typeof resetPasswordSchema>;

function SecurityTab() {
  const user = useAuthStore((s) => s.user);
  const changePwMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      userId: user?.id ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SecurityFormData) =>
    changePwMutation.mutate(data, {
      onSuccess: () =>
        reset({
          userId: user?.id ?? "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }),
    });

  const passwordFields = [
    { name: "currentPassword" as const, label: "Mật khẩu hiện tại" },
    { name: "newPassword" as const, label: "Mật khẩu mới" },
    { name: "confirmPassword" as const, label: "Xác nhận mật khẩu mới" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
      <p className="text-stone-500 text-sm">Thay đổi mật khẩu tài khoản.</p>
      <input type="hidden" {...register("userId")} />

      {passwordFields.map(({ name, label }) => (
        <div key={name} className="flex flex-col gap-1.5">
          <label className="text-stone-400 text-xs font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            {label}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register(name)}
            className={`${inputCls} ${errors[name] ? "border-red-500/60" : ""}`}
          />
          {errors[name] && <p className="text-red-400 text-xs">{errors[name]?.message}</p>}
        </div>
      ))}

      <button
        type="submit"
        disabled={changePwMutation.isPending}
        className="self-start mt-1 px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
      >
        {changePwMutation.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

const TABS = [
  { id: "info", label: "THÔNG TIN", icon: User },
  { id: "avatar", label: "ẢNH ĐẠI DIỆN", icon: Image },
  { id: "security", label: "BẢO MẬT", icon: KeyRound },
];

export default function ProfileTabs() {
  const [active, setActive] = useState("info");

  return (
    <div className="flex flex-col gap-6">
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
          );
        })}
      </div>

      {active === "info" && <InfoTab />}
      {active === "avatar" && <AvatarTab />}
      {active === "security" && <SecurityTab />}
    </div>
  );
}
