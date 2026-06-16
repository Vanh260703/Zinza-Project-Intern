import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <AdminSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
