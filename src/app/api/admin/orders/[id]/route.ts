import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminCookie, parseCookie } from "@/lib/admin";
import { withDb } from "@/lib/db";
import { getCourse } from "@/lib/courses";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAdminCookie(parseCookie(request.headers.get("cookie"), ADMIN_COOKIE))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: "paid" | "cancelled" };
  if (body.status !== "paid" && body.status !== "cancelled") {
    return NextResponse.json({ error: "不支持的状态" }, { status: 400 });
  }

  const result = await withDb((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) return { error: "订单不存在" as const };
    order.status = body.status!;
    if (body.status === "paid") order.paidAt = new Date().toISOString();
    const student = db.students.find((item) => item.id === order.studentId) ?? null;
    const course = getCourse(order.courseId) ?? null;
    return { order, student, course };
  });

  if ("error" in result && result.error) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
