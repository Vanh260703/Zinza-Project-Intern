"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) router.replace("/login");
    else setToken(t);
  }, [router]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-[#1a1927] p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Dashboard</h1>
        <p className="text-sm text-zinc-400 mb-1">Đăng nhập thành công!</p>
        <p className="text-xs text-zinc-600 font-mono break-all mb-6">{token}</p>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300
            hover:bg-zinc-800 hover:text-zinc-100 transition"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
