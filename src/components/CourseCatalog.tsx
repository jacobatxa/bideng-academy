"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { COURSES, formatYuan } from "@/lib/courses";
import type { Course, Student } from "@/lib/types";

const accentBar: Record<Course["accent"], string> = {
  lantern: "bg-lantern",
  moss: "bg-moss",
  ink: "bg-ink",
};

export function CourseCatalog() {
  const router = useRouter();
  const params = useSearchParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/me");
      const data = (await res.json()) as { student: Student | null };
      const sid = params.get("sid");
      if (cancelled) return;
      if (data.student) {
        setStudent(data.student);
        return;
      }
      if (!sid) router.replace("/register");
    })();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  async function enroll(course: Course) {
    setBusyId(course.id);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student?.id ?? params.get("sid"),
          courseId: course.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.order?.status === "paid") {
          router.push(`/success?order=${data.order.id}`);
          return;
        }
        setError(data.error ?? "无法创建订单");
        return;
      }
      router.push(`/pay/${data.order.id}`);
    } catch {
      setError("网络不稳定，请再试一次");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mt-8">
        <p className="text-sm text-ink-soft">注册完成</p>
        <h1 className="mt-1 font-serif text-3xl leading-tight">
          {student ? `${student.name} 的课程` : "选择彼灯课程"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          根据孩子的年龄和兴趣选一季课。选定后进入微信支付。
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-flame">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-4">
        {COURSES.map((course) => (
          <article key={course.id} className="overflow-hidden rounded-[1.6rem] bg-foam/80">
            <div className={`h-1.5 ${accentBar[course.accent]}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] tracking-[0.18em] text-ink-soft uppercase">
                    {course.englishName}
                  </p>
                  <h2 className="mt-1 font-serif text-2xl">{course.name}</h2>
                </div>
                <p className="font-serif text-xl">¥{formatYuan(course.priceFen)}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{course.tagline}</p>
              <p className="mt-3 text-xs text-ink-soft">
                {course.audience} · {course.duration} · {course.format}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm leading-6">
                {course.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-lantern" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={busyId === course.id}
                onClick={() => void enroll(course)}
                className="mt-5 w-full rounded-2xl bg-ink py-3.5 text-paper"
              >
                {busyId === course.id ? "正在创建订单…" : "选择并支付"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
