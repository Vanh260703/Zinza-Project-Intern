import { getPaymentPackages, getBankConfig } from "@/lib/services/payment";
import PaymentContent from "@/components/profile/PaymentContent";

export default async function PaymentPage() {
  const [packages, bankConfig] = await Promise.all([getPaymentPackages(), getBankConfig()]);
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
      <PaymentContent packages={packages} bankConfig={bankConfig} />
    </div>
  );
}
