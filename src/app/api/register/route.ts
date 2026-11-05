import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { nid } from "@/lib/ids";
import { verifyFeishuPhone } from "@/lib/feishu";
import { STUDENT_COOKIE } from "@/lib/admin";
import { validateRegister } from "@/lib/validators";
import type { Student } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Student>;
  const parsed = validateRegister(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "请检查报名信息", errors: parsed.errors }, { status: 400 });
  }

  const feishu = await verifyFeishuPhone(parsed.value.parentPhone);
  if (!feishu.ok) {
    return NextResponse.json({ error: feishu.message, feishu }, { status: 400 });
  }

  const student: Student = {
    id: nid("stu"),
    ...parsed.value,
    feishuVerified: true,
    createdAt: new Date().toISOString(),
  };

  await withDb((db) => {
    db.students.unshift(student);
  });

  const response = NextResponse.json({ student });
  response.cookies.set(STUDENT_COOKIE, student.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
