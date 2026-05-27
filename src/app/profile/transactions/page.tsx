import { Suspense } from "react";
import TransactionsContent from "@/components/profile/TransactionsContent";

export default function TransactionsPage() {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
      <Suspense>
        <TransactionsContent />
      </Suspense>
    </div>
  );
}
