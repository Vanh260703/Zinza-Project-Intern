import DashboardContent from "@/components/admin/dashboard/DashboardContent";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white font-bold text-2xl">Tổng quan</h1>
        <p className="text-stone-500 text-sm mt-0.5">Thống kê hệ thống theo thời gian thực</p>
      </div>
      <DashboardContent />
    </div>
  );
}
