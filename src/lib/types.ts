export type Grade =
  | "一年级"
  | "二年级"
  | "三年级"
  | "四年级"
  | "五年级"
  | "六年级"
  | "初一"
  | "初二"
  | "初三"
  | "高一"
  | "高二"
  | "高三";

export type CourseId = "imagine" | "principle" | "professional";

export type OrderStatus = "created" | "paying" | "paid" | "failed" | "cancelled";

export type Student = {
  id: string;
  name: string;
  age: number;
  school: string;
  grade: Grade;
  favoriteOrganism: string;
  favoriteTopics: string[];
  parentPhone: string;
  feishuVerified: boolean;
  createdAt: string;
};

export type Course = {
  id: CourseId;
  slug: string;
  name: string;
  englishName: string;
  tagline: string;
  summary: string;
  audience: string;
  duration: string;
  format: string;
  priceFen: number;
  accent: "lantern" | "moss" | "ink";
  highlights: string[];
};

export type Order = {
  id: string;
  orderNo: string;
  studentId: string;
  courseId: CourseId;
  amountFen: number;
  status: OrderStatus;
  paymentMethod: "wechat";
  createdAt: string;
  paidAt?: string;
};

export type Database = {
  students: Student[];
  orders: Order[];
};

export type RegisterPayload = {
  name: string;
  age: number;
  school: string;
  grade: Grade;
  favoriteOrganism: string;
  favoriteTopics: string[];
  parentPhone: string;
};
