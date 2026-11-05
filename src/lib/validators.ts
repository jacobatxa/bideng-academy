import type { Grade, RegisterPayload } from "./types";

export const GRADES: Grade[] = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "初一",
  "初二",
  "初三",
  "高一",
  "高二",
  "高三",
];

export const TOPIC_OPTIONS = [
  "宇宙",
  "机器人",
  "画画",
  "编程",
  "动物",
  "故事",
  "科学实验",
  "游戏",
  "音乐",
  "数学",
];

export const ORGANISM_SUGGESTIONS = [
  "萤火虫",
  "章鱼",
  "猫",
  "恐龙",
  "鲸",
  "蘑菇",
  "蚂蚁",
  "鸟",
];

export const PHONE_RE = /^1[3-9]\d{9}$/;

export function isGrade(value: string): value is Grade {
  return (GRADES as string[]).includes(value);
}

export function validateRegister(input: Partial<RegisterPayload>) {
  const errors: Record<string, string> = {};

  const name = input.name?.trim() ?? "";
  if (name.length < 2) errors.name = "请填写学生姓名";

  const age = Number(input.age);
  if (!Number.isInteger(age) || age < 6 || age > 18) {
    errors.age = "年龄请填写 6–18 岁";
  }

  const school = input.school?.trim() ?? "";
  if (school.length < 2) errors.school = "请填写学校名称";

  if (!input.grade || !isGrade(input.grade)) errors.grade = "请选择年级";

  const favoriteOrganism = input.favoriteOrganism?.trim() ?? "";
  if (favoriteOrganism.length < 1) errors.favoriteOrganism = "请填写最喜欢的生物";

  const favoriteTopics = (input.favoriteTopics ?? []).map((t) => t.trim()).filter(Boolean);
  if (favoriteTopics.length < 1) errors.favoriteTopics = "请至少选择一个话题";

  const parentPhone = input.parentPhone?.trim() ?? "";
  if (!PHONE_RE.test(parentPhone)) errors.parentPhone = "请填写 11 位家长手机号";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      name,
      age,
      school,
      grade: input.grade as Grade,
      favoriteOrganism,
      favoriteTopics,
      parentPhone,
    } satisfies RegisterPayload,
  };
}

export function maskPhone(phone: string) {
  if (!PHONE_RE.test(phone)) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}
