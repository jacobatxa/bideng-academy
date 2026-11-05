import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, checkAdminPassword } from "@/lib/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (!checkAdminPassword(body.password ?? "")) {
    return NextResponse.json({ error: "密码不正确" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
