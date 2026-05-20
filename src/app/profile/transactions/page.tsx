import { CreditCard } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-white font-bold text-lg">Lịch sử giao dịch</h2>
        <p className="text-stone-500 text-sm mt-0.5">Các giao dịch nạp và tiêu kẹo</p>
      </div>
      <div className="flex flex-col items-center py-12 gap-3 text-stone-600">
        <CreditCard className="w-10 h-10" strokeWidth={1.5} />
        <p className="text-sm">Chưa có giao dịch nào</p>
      </div>
    </div>
  );
}
