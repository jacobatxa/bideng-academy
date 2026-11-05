import type { Course, CourseId } from "./types";

export const COURSES: Course[] = [
  {
    id: "imagine",
    slug: "ai-chuangxiang",
    name: "AI创想营",
    englishName: "Imagine Camp",
    tagline: "第一次，把 AI 变成孩子手里的玩具。",
    summary:
      "用故事、绘画和动手实验，带 8–12 岁的孩子走进生成式 AI。不讲枯燥术语，先让他们做出一件真正想分享的作品。",
    audience: "8–12 岁",
    duration: "5 天集中营",
    format: "线下小班 · 每班 12 人",
    priceFen: 198000,
    accent: "lantern",
    highlights: [
      "用自己最喜欢的生物，生成绘本主角",
      "和 AI 一起编故事、画场景、做分享卡",
      "理解「提示词」其实就是把想法说清楚",
    ],
  },
  {
    id: "principle",
    slug: "ai-principle",
    name: "AI通识",
    englishName: "Principle",
    tagline: "先建立直觉，再谈模型。",
    summary:
      "面向小学高年级到初中。从数据、分类、训练到生成，把 AI 的基本原理讲成孩子能转述给家长的故事。",
    audience: "10–15 岁",
    duration: "12 次课 / 一学期",
    format: "线下小班 · 配套飞书学习群",
    priceFen: 368000,
    accent: "moss",
    highlights: [
      "数据从哪里来，模型为什么会「学会」",
      "动手标注、训练一个属于自己的小分类器",
      "识别幻觉、偏见，学会当 AI 的主编",
    ],
  },
  {
    id: "professional",
    slug: "ai-professional",
    name: "AI进阶",
    englishName: "Professional",
    tagline: "用真实项目，做出可以放进作品集的东西。",
    summary:
      "面向初高中。提示工程、智能体和工作流不再是概念，而是孩子为自己兴趣做出来的工具和作品。",
    audience: "13–18 岁",
    duration: "16 次课 / 一学期",
    format: "项目制小班 · 作品路演",
    priceFen: 680000,
    accent: "ink",
    highlights: [
      "为「最喜欢的话题」搭建一个可用的 AI 工具",
      "多智能体协作、检索与评价，而不只是聊天",
      "期末作品集 + 路演，给下一阶段的学习留证据",
    ],
  },
];

export function getCourse(id: CourseId | string | undefined) {
  return COURSES.find((course) => course.id === id);
}

export function formatYuan(fen: number) {
  return (fen / 100).toLocaleString("zh-CN");
}
