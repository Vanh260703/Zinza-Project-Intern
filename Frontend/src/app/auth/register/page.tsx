import AuthCard from "@/components/ui/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard>
      <h2 className="mb-6 text-xl font-semibold text-white">Tạo tài khoản</h2>
      <RegisterForm />
    </AuthCard>
  );
}
