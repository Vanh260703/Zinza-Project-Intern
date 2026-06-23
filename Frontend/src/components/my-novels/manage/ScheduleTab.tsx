import { CalendarClock } from "lucide-react";

export default function ScheduleTab() {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <CalendarClock className="w-9 h-9 text-stone-700" strokeWidth={1.5} />
      <p className="text-stone-500 text-sm font-medium">Lịch mở chương</p>
      <p className="text-stone-600 text-xs max-w-xs">
        Tính năng đặt lịch mở chương tự động sẽ sớm được ra mắt.
      </p>
    </div>
  );
}
