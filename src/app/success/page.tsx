import { Suspense } from "react";
import { BrandHeader, PhoneShell } from "@/components/PhoneShell";
import { SuccessView } from "@/components/SuccessView";

export default function SuccessPage() {
  return (
    <PhoneShell>
      <BrandHeader kicker="报名完成" />
      <Suspense fallback={<p className="px-6 pt-10 text-sm text-ink-soft">正在确认报名…</p>}>
        <SuccessView />
      </Suspense>
    </PhoneShell>
  );
}
