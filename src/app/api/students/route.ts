import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminCookie, parseCookie } from "@/lib/admin";
import { readOnly } from "@/lib/db";
import { getCourse } from "@/lib/courses";

export async function GET(request: Request) {
  if (!isAdminCookie(parseCookie(request.headers.get("cookie"), ADMIN_COOKIE))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const rows = await readOnly((db) =>
    db.students.map((student) => {
      const orders = db.orders.filter((order) => order.studentId === student.id);
      const paid = orders.filter((order) => order.status === "paid");
      return {
        ...student,
        orders,
        paidCourses: paid.map((order) => ({
          orderId: order.id,
          courseId: order.courseId,
          courseName: getCourse(order.courseId)?.name ?? order.courseId,
          paidAt: order.paidAt,
          amountFen: order.amountFen,
        })),
      };
    }),
  );

  return NextResponse.json({ students: rows });
}
