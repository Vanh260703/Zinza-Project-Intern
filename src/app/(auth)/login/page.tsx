import AuthCard from "@/components/ui/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard>
      <h2 className="mb-6 text-xl font-semibold text-white">Đăng nhập</h2>

      {params.registered && (
        <p className="mb-4 rounded-xl bg-emerald-950/50 border border-emerald-800/50 px-4 py-2.5 text-sm text-emerald-400">
          Đăng ký thành công! Hãy đăng nhập.
        </p>
      )}

      <LoginForm />
    </AuthCard>
  );
}
