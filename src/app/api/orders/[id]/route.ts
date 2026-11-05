import { NextResponse } from "next/server";
import { readOnly } from "@/lib/db";
import { getCourse } from "@/lib/courses";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await readOnly((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) return null;
    const student = db.students.find((item) => item.id === order.studentId) ?? null;
    const course = getCourse(order.courseId) ?? null;
    return { order, student, course };
  });

  if (!payload) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }
  return NextResponse.json(payload);
}
