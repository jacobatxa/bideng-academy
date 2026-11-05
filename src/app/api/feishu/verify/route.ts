import { NextResponse } from "next/server";
import { verifyFeishuPhone } from "@/lib/feishu";

export async function POST(request: Request) {
  const body = (await request.json()) as { phone?: string };
  const result = await verifyFeishuPhone(body.phone ?? "");
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
