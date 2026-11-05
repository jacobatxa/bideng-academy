"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatYuan } from "@/lib/courses";
import type { Course, Order, Student } from "@/lib/types";

type Payload = {
  order: Order;
  student: Student | null;
  course: Course | null;
};

export function PayCheckout() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const router = useRouter();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [sheet, setSheet] = useState(false);
  const [phase, setPhase] = useState<"ready" | "paying" | "done">("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "订单不存在");
        return;
      }
      setPayload(data);
      if (data.order.status === "paid") router.replace(`/success?order=${orderId}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  async function confirmPay() {
    setPhase("paying");
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const res = await fetch("/api/pay/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("ready");
        setError(data.error ?? "支付未完成");
        return;
      }
      setPhase("done");
      setTimeout(() => router.push(`/success?order=${orderId}`), 600);
    } catch {
      setPhase("ready");
      setError("网络不稳定，请再试一次");
    }
  }

  if (!payload?.order || !payload.course) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-sm text-ink-soft">
        {error || "正在打开订单…"}
      </div>
    );
  }

  const { order, student, course } = payload;

  return (
    <div className="flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mt-8">
        <p className="text-sm text-ink-soft">确认订单</p>
        <h1 className="mt-1 font-serif text-3xl">微信支付</h1>
      </div>

      <div className="mt-6 rounded-[1.6rem] bg-foam/80 p-5">
        <p className="text-sm text-ink-soft">课程</p>
        <p className="mt-1 font-serif text-2xl">{course.name}</p>
        <p className="mt-2 text-sm text-ink-soft">{course.englishName}</p>
        <dl className="mt-5 space-y-2 text-sm">
          <Row label="学员" value={student?.name ?? "—"} />
          <Row label="家长手机" value={student?.parentPhone ?? "—"} />
          <Row label="订单号" value={order.orderNo} />
        </dl>
        <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-4">
          <span className="text-sm text-ink-soft">应付</span>
          <span className="font-serif text-3xl">¥{formatYuan(order.amountFen)}</span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-ink-soft">
        家长从公众号进入时，正式环境会调起微信 JSAPI 收银台。当前为沙箱：点支付即完成报名，方便先跑通流程。
      </p>
      {error ? <p className="mt-3 text-sm text-flame">{error}</p> : null}

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-wechat py-3.5 font-medium text-white"
        >
          <WechatMark />
          微信支付
        </button>
        <button
          type="button"
          className="mt-3 w-full py-2 text-sm text-ink-soft"
          onClick={() => router.push("/courses")}
        >
          返回课程目录
        </button>
      </div>

      {sheet ? (
        <div className="absolute inset-0 z-20 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-black/60">向商户付款</p>
              <button type="button" onClick={() => setSheet(false)} className="text-black/40">
                关闭
              </button>
            </div>
            <p className="mt-6 text-center text-4xl font-medium tracking-tight">
              ¥{formatYuan(order.amountFen)}
            </p>
            <div className="mt-6 space-y-3 border-t border-black/5 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-black/45">收款方</span>
                <span>彼灯教育</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/45">商品</span>
                <span>{course.name}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={phase !== "ready"}
              onClick={() => void confirmPay()}
              className="mt-6 w-full rounded-xl bg-wechat py-3.5 text-white"
            >
              {phase === "ready" && "立即支付"}
              {phase === "paying" && "支付中…"}
              {phase === "done" && "支付成功"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function WechatMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M9.5 4.2c-4.2 0-7.5 2.8-7.5 6.2 0 1.9 1 3.6 2.6 4.8l-.6 2.2 2.5-1.3c.8.2 1.6.4 2.4.4.3 0 .5 0 .8-.1-.2-.5-.3-1-.3-1.6 0-3.3 3.2-6 7.1-6 .2 0 .4 0 .6.1C16.5 6.2 13.3 4.2 9.5 4.2zm-2 3.1a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4.2 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
      <path d="M21.9 14.4c0-2.9-2.9-5.2-6.4-5.2s-6.4 2.3-6.4 5.2 2.9 5.2 6.4 5.2c.6 0 1.2-.1 1.8-.2l2.1 1.1-.5-1.8c1.4-1 2.3-2.5 2.3-4.3zm-8.4-1a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm4.1 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" />
    </svg>
  );
}
