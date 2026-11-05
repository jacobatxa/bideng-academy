import { Suspense } from "react";
import { BrandHeader, PhoneShell } from "@/components/PhoneShell";
import { CourseCatalog } from "@/components/CourseCatalog";

export default function CoursesPage() {
  return (
    <PhoneShell>
      <BrandHeader kicker="课程目录" />
      <Suspense fallback={<p className="px-6 pt-10 text-sm text-ink-soft">正在打开课程…</p>}>
        <CourseCatalog />
      </Suspense>
    </PhoneShell>
  );
}
