import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "bideng_admin";
export const STUDENT_COOKIE = "bideng_sid";

function secret() {
  return process.env.ADMIN_SECRET ?? "bideng-local-secret";
}

function password() {
  return process.env.ADMIN_PASSWORD ?? "bideng-admin";
}

export function adminToken() {
  return createHmac("sha256", secret()).update(password()).digest("hex");
}

export function checkAdminPassword(input: string) {
  return input === password();
}

export function isAdminCookie(value: string | undefined) {
  if (!value) return false;
  const expected = Buffer.from(adminToken());
  const actual = Buffer.from(value);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function parseCookie(header: string | null, name: string) {
  if (!header) return undefined;
  const parts = header.split(";").map((part) => part.trim());
  const hit = parts.find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}
