"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatYuan } from "@/lib/courses";
import type { Course, Order, Student } from "@/lib/types";

export function SuccessView() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [payload, setPayload] = useState<{
    order: Order;
    student: Student | null;
    course: Course | null;
  } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!cancelled && res.ok) setPayload(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mt-16 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss text-2xl text-white">
          ✓
        </div>
        <h1 className="mt-6 font-serif text-3xl">报名成功</h1>
        <p className="mt-3 max-w-xs text-sm leading-6 text-ink-soft">
          老师会通过飞书联系家长，确认开营与进群安排。
        </p>
      </div>

      <div className="mt-10 rounded-[1.6rem] bg-foam/80 p-5 text-sm">
        <p className="font-serif text-2xl">{payload?.course?.name ?? "彼灯课程"}</p>
        <p className="mt-3 text-ink-soft">
          {payload?.student?.name} · {payload?.student?.grade}
        </p>
        {payload?.order ? (
          <p className="mt-2 text-ink-soft">
            已支付 ¥{formatYuan(payload.order.amountFen)} · {payload.order.orderNo}
          </p>
        ) : null}
      </div>

      <div className="mt-auto pt-10">
        <a
          href="/courses"
          className="block rounded-2xl bg-ink py-3.5 text-center text-paper"
        >
          再看其他课程
        </a>
      </div>
    </div>
  );
}
