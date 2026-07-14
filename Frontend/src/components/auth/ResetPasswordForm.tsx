"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import {
  resetPasswordByTokenSchema,
  type ResetPasswordByTokenFormData,
} from "@/schemas/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { showToast } from "@/lib/toast";
import { useState } from "react";

interface Props {
  token: string | null;
}

export default function ResetPasswordForm({ token }: Props) {
  const [done, setDone] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!token);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordByTokenFormData>({
    resolver: zodResolver(resetPasswordByTokenSchema),
  });

  if (invalidToken) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <AlertCircle size={26} className="text-red-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Đường dẫn không hợp lệ</p>
          <p className="mt-1 text-xs text-stone-500">
            Token đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu lại.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          Gửi lại email
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <CheckCircle size={26} className="text-green-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Đặt lại mật khẩu thành công!</p>
          <p className="mt-1 text-xs text-stone-500">
            Bạn có thể đăng nhập bằng mật khẩu mới.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordByTokenFormData) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: data.newPassword }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        setInvalidToken(true);
        return;
      }
      const json = await res.json().catch(() => ({}));
      showToast.error((json as { message?: string }).message ?? "Đặt lại mật khẩu thất bại.");
      return;
    }

    setDone(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-xs text-stone-500 -mt-2">Nhập mật khẩu mới cho tài khoản của bạn.</p>

      <Input
        label="Mật khẩu mới"
        type="password"
        placeholder="Ít nhất 6 ký tự"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu mới"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button loading={isSubmitting}>Đặt lại mật khẩu</Button>

      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors"
      >
        <ArrowLeft size={13} />
        Quay lại đăng nhập
      </Link>
    </form>
  );
}
