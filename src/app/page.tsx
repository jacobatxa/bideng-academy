import { BrandHeader, PhoneShell } from "@/components/PhoneShell";
import { COURSES } from "@/lib/courses";

export default function Home() {
  return (
    <PhoneShell>
      <BrandHeader kicker="成为彼灯学员" />
      <main className="flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="mt-12 font-serif text-[2.15rem] leading-[1.2] text-pretty">
          把一盏灯，
          <br />
          递给正在长大的孩子。
        </p>
        <p className="mt-5 max-w-[20rem] text-sm leading-7 text-ink-soft">
          从公众号底部菜单打开本页。填写孩子档案后，选择 AI创想营、Principle 或 Professional，完成报名。
        </p>

        <ul className="mt-10 space-y-2 text-sm">
          {COURSES.map((course) => (
            <li
              key={course.id}
              className="flex items-baseline justify-between border-b border-ink/10 py-3"
            >
              <span className="font-serif text-lg">{course.name}</span>
              <span className="text-xs tracking-wide text-ink-soft">{course.englishName}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-10">
          <a
            href="/register"
            className="block rounded-2xl bg-ink py-4 text-center text-paper"
          >
            填写孩子档案
          </a>
          <p className="mt-4 text-center text-xs leading-5 text-ink-soft">
            请使用已注册飞书的家长手机号。老师会在飞书里与你会合。
          </p>
        </div>
      </main>
    </PhoneShell>
  );
}
