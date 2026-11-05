import { PHONE_RE } from "./validators";

export type FeishuVerifyResult = {
  ok: boolean;
  source: "demo" | "strict" | "invalid";
  message: string;
};

/**
 * 家长手机号需要已注册飞书，后续通知、分班、学习群都走飞书。
 *
 * 演示模式：校验中国大陆 11 位手机号，视作已注册。
 * 接入飞书通讯录后：用手机号查 contact/v3/users，确认存在再放行。
 */
export async function verifyFeishuPhone(phone: string): Promise<FeishuVerifyResult> {
  const trimmed = phone.trim();
  if (!PHONE_RE.test(trimmed)) {
    return {
      ok: false,
      source: "invalid",
      message: "请填写 11 位中国大陆手机号",
    };
  }

  const mode = process.env.FEISHU_MODE ?? "demo";
  if (mode === "strict") {
    const allow = (process.env.FEISHU_ALLOWLIST ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const ok = allow.includes(trimmed);
    return {
      ok,
      source: "strict",
      message: ok
        ? "已在飞书通讯录中找到该家长"
        : "未找到该手机号对应的飞书账号，请先用该号码注册飞书",
    };
  }

  return {
    ok: true,
    source: "demo",
    message: "号码格式正确。当前为演示模式，接入飞书后将核对通讯录。",
  };
}
