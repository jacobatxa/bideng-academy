import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { getCourse } from "@/lib/courses";
import { nid, orderNo } from "@/lib/ids";
import { parseCookie, STUDENT_COOKIE } from "@/lib/admin";
import { createPrepay } from "@/lib/wechat-pay";
import type { CourseId, Order } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { studentId?: string; courseId?: CourseId };
  const cookieSid = parseCookie(request.headers.get("cookie"), STUDENT_COOKIE);
  const studentId = body.studentId || cookieSid;
  const course = getCourse(body.courseId);

  if (!studentId) {
    return NextResponse.json({ error: "请先完成学员注册" }, { status: 400 });
  }
  if (!course) {
    return NextResponse.json({ error: "课程不存在" }, { status: 400 });
  }

  const result = await withDb((db) => {
    const student = db.students.find((item) => item.id === studentId);
    if (!student) return { error: "学员不存在" as const };

    const existingPaid = db.orders.find(
      (order) =>
        order.studentId === studentId &&
        order.courseId === course.id &&
        order.status === "paid",
    );
    if (existingPaid) {
      return { error: "该课程已报名成功" as const, order: existingPaid, student, course };
    }

    const open = db.orders.find(
      (order) =>
        order.studentId === studentId &&
        order.courseId === course.id &&
        (order.status === "created" || order.status === "paying"),
    );
    if (open) return { order: open, student, course };

    const order: Order = {
      id: nid("ord"),
      orderNo: orderNo(),
      studentId,
      courseId: course.id,
      amountFen: course.priceFen,
      status: "created",
      paymentMethod: "wechat",
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(order);
    return { order, student, course };
  });

  if ("error" in result && result.error) {
    return NextResponse.json(result, { status: 400 });
  }

  const pay = await createPrepay(result.order);
  return NextResponse.json({ ...result, pay });
}
