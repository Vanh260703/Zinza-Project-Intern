import SuspenseTable from "@/components/admin/suspense/SuspenseTable";

export default function AdminSuspensePage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-white font-bold text-2xl">Đối soát</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Các giao dịch tiền/kẹo hệ thống không tự đối soát được, cần admin xem xét
        </p>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6">
        <SuspenseTable />
      </div>
    </div>
  );
}
