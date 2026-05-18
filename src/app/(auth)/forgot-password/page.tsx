import AuthCard from "@/components/ui/AuthCard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <h2 className="mb-6 text-xl font-semibold text-white">Quên mật khẩu</h2>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
