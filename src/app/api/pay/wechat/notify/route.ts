import { NextResponse } from "next/server";

/** 正式微信支付 APIv3 异步通知入口。沙箱不会走到这里。 */
export async function POST() {
  return NextResponse.json(
    { error: "尚未接入微信支付 APIv3。请先配置商户证书后再启用此回调。" },
    { status: 501 },
  );
}
