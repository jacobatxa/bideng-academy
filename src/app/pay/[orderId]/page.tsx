import { Suspense } from "react";
import { BrandHeader, PhoneShell } from "@/components/PhoneShell";
import { PayCheckout } from "@/components/PayCheckout";

export const instant = false;

export default function PayPage() {
  return (
    <PhoneShell>
      <BrandHeader kicker="支付报名" />
      <Suspense fallback={<p className="px-6 pt-10 text-sm text-ink-soft">正在打开订单…</p>}>
        <PayCheckout />
      </Suspense>
    </PhoneShell>
  );
}
