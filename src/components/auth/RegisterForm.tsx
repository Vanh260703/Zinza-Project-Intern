"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { GENDER_OPTIONS } from "@/enums/auth";
import { showToast } from "@/lib/toast";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/userStore";

export default function RegisterForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace(user.role === "admin" ? "/admin" : "/");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      const msg = json.message ?? "Đăng ký thất bại";
      setServerError(msg);
      showToast.error(msg);
      return;
    }

    showToast.success("Đăng ký thành công!", "Hãy đăng nhập để tiếp tục.");

    router.push("/auth/login?registered=1");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label="Họ tên"
        type="text"
        placeholder="Nguyễn Văn A"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Select
        label="Giới tính"
        options={GENDER_OPTIONS}
        error={errors.gender?.message}
        {...register("gender")}
      />

      <Input
        label="Mật khẩu"
        type="password"
        placeholder="Nhập mật khẩu"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {serverError && (
        <p className="rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-2.5 text-sm text-red-400">
          {serverError}
        </p>
      )}

      <Button loading={isSubmitting}>Tạo tài khoản</Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-800" />
        <span className="text-xs text-stone-600">hoặc</span>
        <div className="flex-1 h-px bg-stone-800" />
      </div>

      <p className="text-center text-sm text-stone-500">
        Đã có tài khoản?{" "}
        <Link
          href="/auth/login"
          className="text-amber-400 font-medium hover:text-amber-300 transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </form>
  );
}
