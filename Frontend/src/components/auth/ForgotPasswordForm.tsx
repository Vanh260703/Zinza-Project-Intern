"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { showToast } from "@/lib/toast";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      showToast.error("Có lỗi xảy ra, thử lại sau.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <Mail size={26} className="text-amber-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Kiểm tra hộp thư của bạn</p>
          <p className="mt-1 text-xs text-stone-500">
            Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-xs text-stone-500 -mt-2">
        Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
      </p>

      <Input
        label="Email"
        type="email"
        placeholder="example@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Button loading={isSubmitting}>Gửi link đặt lại</Button>

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
