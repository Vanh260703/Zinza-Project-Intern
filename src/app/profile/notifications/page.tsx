import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-white font-bold text-lg">Thông báo</h2>
        <p className="text-stone-500 text-sm mt-0.5">Các thông báo gần đây</p>
      </div>
      <div className="flex flex-col items-center py-12 gap-3 text-stone-600">
        <Bell className="w-10 h-10" strokeWidth={1.5} />
        <p className="text-sm">Chưa có thông báo nào</p>
      </div>
    </div>
  );
}
