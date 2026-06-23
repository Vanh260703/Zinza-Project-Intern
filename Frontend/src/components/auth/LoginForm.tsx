"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { showToast } from "@/lib/toast";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useLibraryStore } from "@/stores/libraryStore";

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setWallet = useAuthStore((state) => state.setWallet);
  const user = useAuthStore((state) => state.user);
  const initLibrary = useLibraryStore((state) => state.init);
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      const msg = json.message ?? "Đăng nhập thất bại";
      setServerError(msg);
      showToast.error(msg);
      return;
    }

    const { accessToken, user, wallet, history, bookmarks, purchasedChapterIds } = await res.json();
    setUser(user, accessToken);
    setWallet(wallet);
    initLibrary(user.id, history, bookmarks, purchasedChapterIds);
    showToast.success("Chào mừng trở lại!", user.name);

    router.push(user.role === "admin" ? "/admin" : "/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-4">
        <Input
          label="Email"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="mb-2">
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
          error={errors.password?.message}
          labelRight={
            <Link
              href="/auth/forgot-password"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          }
          {...register("password")}
        />
      </div>

      {serverError && (
        <p className="mt-4 rounded-xl bg-red-950/50 border border-red-800/50 px-4 py-2.5 text-sm text-red-400">
          {serverError}
        </p>
      )}

      <div className="mt-6">
        <Button loading={isSubmitting}>Đăng nhập</Button>
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-stone-800" />
        <span className="text-xs text-stone-600">hoặc</span>
        <div className="flex-1 h-px bg-stone-800" />
      </div>

      <p className="text-center text-sm text-stone-500">
        Chưa có tài khoản?{" "}
        <Link
          href="/auth/register"
          className="text-amber-400 font-medium hover:text-amber-300 transition-colors"
        >
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
