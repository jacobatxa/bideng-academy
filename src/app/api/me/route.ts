import { NextResponse } from "next/server";
import { parseCookie, STUDENT_COOKIE } from "@/lib/admin";
import { readOnly } from "@/lib/db";

export async function GET(request: Request) {
  const studentId = parseCookie(request.headers.get("cookie"), STUDENT_COOKIE);
  if (!studentId) {
    return NextResponse.json({ student: null }, { status: 200 });
  }

  const student = await readOnly((db) => db.students.find((item) => item.id === studentId) ?? null);
  return NextResponse.json({ student });
}
