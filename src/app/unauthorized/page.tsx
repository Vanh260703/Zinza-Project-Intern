import ErrorPage from "@/components/error/ErrorPage";

export default function UnauthorizedPage() {
  return (
    <ErrorPage
      code={401}
      title="Bạn chưa đăng nhập"
      description="Vui lòng đăng nhập để truy cập trang này."
      action={{ label: "Đăng nhập", href: "/auth/login" }}
    />
  );
}
