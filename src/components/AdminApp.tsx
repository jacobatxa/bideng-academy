"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSES, formatYuan } from "@/lib/courses";
import { maskPhone } from "@/lib/validators";
import type { CourseId, Order, Student } from "@/lib/types";

type Row = Student & {
  orders: Order[];
  paidCourses: {
    orderId: string;
    courseId: CourseId;
    courseName: string;
    paidAt?: string;
    amountFen: number;
  }[];
};

export function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [students, setStudents] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<"all" | CourseId | "unpaid">("all");
  const [selected, setSelected] = useState<Row | null>(null);

  async function load() {
    const res = await fetch("/api/students");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setStudents(data.students ?? []);
    setAuthed(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/students").then(async (res) => {
      if (cancelled) return;
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (cancelled) return;
      setStudents(data.students ?? []);
      setAuthed(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("密码不正确");
      return;
    }
    setPassword("");
    await load();
  }

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const hay = `${student.name}${student.school}${student.parentPhone}${student.grade}`;
      if (query && !hay.includes(query.trim())) return false;
      if (courseFilter === "unpaid") return student.paidCourses.length === 0;
      if (courseFilter !== "all") {
        return student.paidCourses.some((item) => item.courseId === courseFilter);
      }
      return true;
    });
  }, [students, query, courseFilter]);

  const paidCount = students.filter((s) => s.paidCourses.length > 0).length;

  if (authed === null) {
    return <div className="p-10 text-sm text-ink-soft">正在载入后台…</div>;
  }

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#241c14] px-6">
        <form
          onSubmit={(e) => void login(e)}
          className="paper-bg w-full max-w-sm rounded-[1.8rem] p-8"
        >
          <p className="font-serif text-3xl">彼灯后台</p>
          <p className="mt-2 text-sm text-ink-soft">学员注册与报名管理</p>
          <input
            className="field mt-8"
            type="password"
            placeholder="管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginError ? <p className="mt-2 text-sm text-flame">{loginError}</p> : null}
          <button className="mt-5 w-full rounded-2xl bg-ink py-3.5 text-paper" type="submit">
            进入
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f6f1e8] text-ink">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 px-6 py-5 md:px-10">
        <div>
          <p className="font-serif text-2xl tracking-[0.12em]">彼灯 · 学员管理</p>
          <p className="mt-1 text-sm text-ink-soft">
            {students.length} 名学员 · {paidCount} 人已缴费
          </p>
        </div>
        <button
          className="text-sm text-ink-soft"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setAuthed(false);
          }}
        >
          退出
        </button>
      </header>

      <div className="px-6 py-6 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="field md:max-w-xs"
            placeholder="搜索姓名 / 学校 / 手机号"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="field md:max-w-xs"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value as typeof courseFilter)}
          >
            <option value="all">全部学员</option>
            <option value="unpaid">尚未缴费</option>
            {COURSES.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-3 md:hidden">
          {filtered.length === 0 ? (
            <p className="rounded-3xl bg-white/70 px-5 py-12 text-center text-sm text-ink-soft">
              还没有匹配的学员。家长完成注册后会出现在这里。
            </p>
          ) : (
            filtered.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelected(student)}
                className="w-full rounded-3xl bg-white/80 p-5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {student.age} 岁 · {student.grade} · {student.school}
                    </p>
                  </div>
                  {student.paidCourses.length ? (
                    <span className="text-xs text-moss">已缴费</span>
                  ) : (
                    <span className="text-xs text-flame">未缴费</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-ink-soft">{maskPhone(student.parentPhone)}</p>
                <p className="mt-1 text-sm">
                  {student.paidCourses.length
                    ? student.paidCourses.map((item) => item.courseName).join("、")
                    : `${student.favoriteOrganism} · ${student.favoriteTopics.join(" / ")}`}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="mt-6 hidden overflow-x-auto rounded-3xl bg-white/70 md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-ink-soft">
              <tr className="border-b border-ink/10">
                <th className="px-5 py-4 font-normal">学员</th>
                <th className="px-5 py-4 font-normal">学校 / 年级</th>
                <th className="px-5 py-4 font-normal">家长手机</th>
                <th className="px-5 py-4 font-normal">兴趣</th>
                <th className="px-5 py-4 font-normal">报名课程</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr
                  key={student.id}
                  className="cursor-pointer border-b border-ink/5 hover:bg-paper/60"
                  onClick={() => setSelected(student)}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-ink-soft">{student.age} 岁</p>
                  </td>
                  <td className="px-5 py-4">
                    {student.school}
                    <span className="text-ink-soft"> · {student.grade}</span>
                  </td>
                  <td className="px-5 py-4">{maskPhone(student.parentPhone)}</td>
                  <td className="px-5 py-4 text-ink-soft">
                    {student.favoriteOrganism} · {student.favoriteTopics.join(" / ")}
                  </td>
                  <td className="px-5 py-4">
                    {student.paidCourses.length ? (
                      student.paidCourses.map((item) => item.courseName).join("、")
                    ) : (
                      <span className="text-flame">未缴费</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-ink-soft">
                    还没有匹配的学员。家长完成注册后会出现在这里。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <StudentDrawer
          student={selected}
          onClose={() => setSelected(null)}
          onChanged={async () => {
            await load();
            setSelected(null);
          }}
        />
      ) : null}
    </div>
  );
}

function StudentDrawer({
  student,
  onClose,
  onChanged,
}: {
  student: Row;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/30">
      <aside className="h-full w-full max-w-md overflow-y-auto bg-[#fffaf3] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-serif text-3xl">{student.name}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {student.age} 岁 · {student.grade} · {student.school}
            </p>
          </div>
          <button onClick={onClose} className="text-sm text-ink-soft">
            关闭
          </button>
        </div>
        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">家长手机</dt>
            <dd>{student.parentPhone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">飞书核对</dt>
            <dd>{student.feishuVerified ? "已核对" : "未核对"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">最喜欢的生物</dt>
            <dd>{student.favoriteOrganism}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">话题</dt>
            <dd className="text-right">{student.favoriteTopics.join("、")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">注册时间</dt>
            <dd>{new Date(student.createdAt).toLocaleString("zh-CN")}</dd>
          </div>
        </dl>

        <h3 className="mt-8 font-serif text-xl">订单</h3>
        <div className="mt-3 space-y-3">
          {student.orders.length === 0 ? (
            <p className="text-sm text-ink-soft">还没有选课订单。</p>
          ) : (
            student.orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white p-4 text-sm">
                <div className="flex justify-between">
                  <span>{COURSES.find((c) => c.id === order.courseId)?.name}</span>
                  <span>¥{formatYuan(order.amountFen)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  {order.orderNo} · {statusLabel(order.status)}
                </p>
                {order.status !== "paid" ? (
                  <button
                    className="mt-3 rounded-xl bg-ink px-3 py-2 text-xs text-paper"
                    onClick={async () => {
                      await fetch(`/api/admin/orders/${order.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "paid" }),
                      });
                      await onChanged();
                    }}
                  >
                    标记为已支付
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function statusLabel(status: Order["status"]) {
  switch (status) {
    case "paid":
      return "已支付";
    case "created":
    case "paying":
      return "待支付";
    case "failed":
      return "失败";
    case "cancelled":
      return "已取消";
  }
}
