import AuthCard from "@/components/ui/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <AuthCard>
      <h2 className="mb-6 text-xl font-semibold text-white">Đặt lại mật khẩu</h2>
      <ResetPasswordForm token={token ?? null} />
    </AuthCard>
  );
}
