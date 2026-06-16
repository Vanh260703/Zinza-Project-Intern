import UsersTable from "@/components/admin/users/UsersTable";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-white font-bold text-2xl">Người dùng</h1>
        <p className="text-stone-500 text-sm mt-0.5">Quản lý tất cả tài khoản trong hệ thống</p>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6">
        <UsersTable />
      </div>
    </div>
  );
}
