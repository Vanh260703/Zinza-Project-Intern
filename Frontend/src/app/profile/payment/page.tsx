import PaymentContent from "@/components/profile/PaymentContent";
import type { CandyPackage } from "@/types/payment";

// Trang cá nhân (ví riêng từng user) — không prerender tĩnh lúc build (build image
// không có BE để fetch), luôn render động theo từng request.
export const dynamic = "force-dynamic";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default async function PaymentPage() {
  const res = await fetch(`${BE_URL}/api/v1/payments/candy-packages`, {
    next: { revalidate: 300 },
  });
  const packages: CandyPackage[] = res.ok ? await res.json() : [];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
      <PaymentContent packages={packages} />
    </div>
  );
}
