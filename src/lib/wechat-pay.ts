import type { Order } from "./types";

/**
 * 支付方案：公众号内 H5 走微信支付 JSAPI。
 *
 * 家长从公众号底部菜单点开页面，本身就在微信里。JSAPI 可以直接调起收银台，
 * 不用扫码、不用跳支付宝，是这个场景摩擦最低的方式。
 *
 * 当前 `WECHAT_PAY_ENABLED` 未打开时使用沙箱：前端展示微信支付样式，
 * 后端直接把订单标为已支付。接入商户号后，把 createPrepay / handleNotify
 * 换成微信支付 APIv3 即可，订单模型不用改。
 */
export function isLiveWechatPay() {
  return process.env.WECHAT_PAY_ENABLED === "true";
}

export async function createPrepay(order: Order) {
  if (!isLiveWechatPay()) {
    return {
      mode: "sandbox" as const,
      prepayId: `sandbox_${order.id}`,
    };
  }

  throw new Error(
    "已打开 WECHAT_PAY_ENABLED，但尚未配置微信支付 APIv3（AppID / 商户号 / 证书）。",
  );
}

export function sandboxNote() {
  return isLiveWechatPay()
    ? "支付将在微信内完成"
    : "当前为微信支付沙箱，确认支付后即视为报名成功";
}
