"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GRADES,
  ORGANISM_SUGGESTIONS,
  TOPIC_OPTIONS,
  validateRegister,
} from "@/lib/validators";
import type { Grade } from "@/lib/types";

const STEPS = ["档案", "兴趣", "家长"] as const;

type FormState = {
  name: string;
  age: string;
  school: string;
  grade: Grade | "";
  favoriteOrganism: string;
  favoriteTopics: string[];
  parentPhone: string;
};

const empty: FormState = {
  name: "",
  age: "",
  school: "",
  grade: "",
  favoriteOrganism: "",
  favoriteTopics: [],
  parentPhone: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feishu, setFeishu] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const parsed = useMemo(
    () =>
      validateRegister({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        grade: form.grade || undefined,
      }),
    [form],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleTopic(topic: string) {
    setForm((prev) => ({
      ...prev,
      favoriteTopics: prev.favoriteTopics.includes(topic)
        ? prev.favoriteTopics.filter((item) => item !== topic)
        : [...prev.favoriteTopics, topic],
    }));
    setErrors((prev) => ({ ...prev, favoriteTopics: "" }));
  }

  function validateStep() {
    const nextErrors: Record<string, string> = {};
    if (step === 0) {
      if (parsed.errors.name) nextErrors.name = parsed.errors.name;
      if (parsed.errors.age) nextErrors.age = parsed.errors.age;
      if (parsed.errors.school) nextErrors.school = parsed.errors.school;
      if (parsed.errors.grade) nextErrors.grade = parsed.errors.grade;
    }
    if (step === 1) {
      if (parsed.errors.favoriteOrganism) {
        nextErrors.favoriteOrganism = parsed.errors.favoriteOrganism;
      }
      if (parsed.errors.favoriteTopics) {
        nextErrors.favoriteTopics = parsed.errors.favoriteTopics;
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function verifyPhone() {
    setBusy(true);
    setFeishu(null);
    try {
      const res = await fetch("/api/feishu/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.parentPhone }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      setFeishu(data);
      if (!data.ok) setErrors((prev) => ({ ...prev, parentPhone: data.message }));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setBusy(true);
    setSubmitError("");
    try {
      let verified = feishu?.ok ?? false;
      if (!verified) {
        const check = await fetch("/api/feishu/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.parentPhone }),
        });
        const data = (await check.json()) as { ok: boolean; message: string };
        setFeishu(data);
        verified = data.ok;
        if (!verified) {
          setErrors((prev) => ({ ...prev, parentPhone: data.message }));
          return;
        }
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.value),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "注册失败，请稍后再试");
        return;
      }
      router.push(`/courses?sid=${data.student.id}`);
    } catch {
      setSubmitError("网络不稳定，请再试一次");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mt-8 flex gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1 rounded-full ${index <= step ? "bg-ink" : "bg-ink/15"}`}
            />
            <p className={`mt-2 text-xs ${index === step ? "text-ink" : "text-ink-soft"}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h1 className="font-serif text-3xl leading-tight">
          {step === 0 && "先认识一下孩子"}
          {step === 1 && "TA 对世界好奇什么"}
          {step === 2 && "我们如何找到你"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {step === 0 && "姓名、年龄、学校和年级，用于分班。"}
          {step === 1 && "这些兴趣会写进孩子的小档案，老师备课会用到。"}
          {step === 2 && "请填写已注册飞书的家长手机号，后续通知都在飞书里。"}
        </p>
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-4">
        {step === 0 && (
          <>
            <Field label="学生姓名" error={errors.name}>
              <input
                className="field"
                value={form.name}
                placeholder="孩子的真实姓名"
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="年龄" error={errors.age}>
                <input
                  className="field"
                  inputMode="numeric"
                  value={form.age}
                  placeholder="例如 10"
                  onChange={(e) => set("age", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Field label="年级" error={errors.grade}>
                <select
                  className="field"
                  value={form.grade}
                  onChange={(e) => set("grade", e.target.value as Grade)}
                >
                  <option value="">请选择</option>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="学校" error={errors.school}>
              <input
                className="field"
                value={form.school}
                placeholder="就读学校全称"
                onChange={(e) => set("school", e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="最喜欢的生物" error={errors.favoriteOrganism}>
              <input
                className="field"
                value={form.favoriteOrganism}
                placeholder="萤火虫、章鱼、猫……"
                onChange={(e) => set("favoriteOrganism", e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {ORGANISM_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => set("favoriteOrganism", item)}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      form.favoriteOrganism === item
                        ? "bg-ink text-paper"
                        : "bg-white/50 text-ink"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="最喜欢的话题" error={errors.favoriteTopics}>
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map((topic) => {
                  const on = form.favoriteTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`rounded-full px-3 py-1.5 text-sm ${
                        on ? "bg-ink text-paper" : "bg-white/50 text-ink"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="家长手机号（已注册飞书）" error={errors.parentPhone}>
              <input
                className="field"
                inputMode="tel"
                maxLength={11}
                value={form.parentPhone}
                placeholder="11 位手机号"
                onChange={(e) => {
                  set("parentPhone", e.target.value.replace(/\D/g, "").slice(0, 11));
                  setFeishu(null);
                }}
              />
            </Field>
            <button
              type="button"
              onClick={verifyPhone}
              disabled={busy}
              className="rounded-2xl border border-ink/15 bg-white/60 px-4 py-3 text-sm"
            >
              {busy ? "正在核对飞书…" : "核对是否已注册飞书"}
            </button>
            {feishu ? (
              <p className={`text-sm ${feishu.ok ? "text-moss" : "text-flame"}`}>
                {feishu.message}
              </p>
            ) : null}
            {submitError ? <p className="text-sm text-flame">{submitError}</p> : null}
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            className="flex-1 rounded-2xl border border-ink/15 py-3.5"
            onClick={() => setStep((s) => s - 1)}
          >
            上一步
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          className="flex-[2] rounded-2xl bg-ink py-3.5 text-paper"
          onClick={() => {
            if (step < 2) {
              if (validateStep()) setStep((s) => s + 1);
              return;
            }
            void submit();
          }}
        >
          {step < 2 ? "继续" : busy ? "提交中…" : "完成注册，看课程"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <p className="mb-2 text-sm text-ink-soft">{label}</p>
      {children}
      {error ? <p className="mt-1.5 text-xs text-flame">{error}</p> : null}
    </div>
  );
}
