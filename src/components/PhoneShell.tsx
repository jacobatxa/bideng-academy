import { LanternMark } from "./LanternMark";

export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper md:bg-[#241c14] md:flex md:items-center md:justify-center md:py-8">
      <div className="paper-bg grain relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-hidden overflow-y-auto md:min-h-[844px] md:overflow-hidden md:rounded-[36px] md:shadow-[0_40px_80px_rgba(0,0,0,.45)]">
        <div className="relative z-10 flex min-h-dvh flex-1 flex-col md:min-h-[844px]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function BrandHeader({ kicker }: { kicker?: string }) {
  return (
    <header className="flex items-center gap-3 px-6 pt-[max(2rem,env(safe-area-inset-top))]">
      <LanternMark />
      <div>
        <p className="font-serif text-[1.35rem] leading-none tracking-[0.18em]">彼灯</p>
        {kicker ? <p className="mt-1 text-xs tracking-wide text-ink-soft">{kicker}</p> : null}
      </div>
    </header>
  );
}
