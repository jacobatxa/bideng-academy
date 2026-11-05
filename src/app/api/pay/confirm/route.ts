import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { getCourse } from "@/lib/courses";
import { isLiveWechatPay } from "@/lib/wechat-pay";

export async function POST(request: Request) {
  if (isLiveWechatPay()) {
    return NextResponse.json(
      { error: "正式微信支付请走微信回调 /api/pay/wechat/notify，不能手动确认" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { orderId?: string };
  if (!body.orderId) {
    return NextResponse.json({ error: "缺少订单" }, { status: 400 });
  }

  const result = await withDb((db) => {
    const order = db.orders.find((item) => item.id === body.orderId);
    if (!order) return { error: "订单不存在" as const };
    if (order.status !== "paid") {
      order.status = "paid";
      order.paidAt = new Date().toISOString();
    }
    const student = db.students.find((item) => item.id === order.studentId) ?? null;
    const course = getCourse(order.courseId) ?? null;
    return { order, student, course };
  });

  if ("error" in result && result.error) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}
