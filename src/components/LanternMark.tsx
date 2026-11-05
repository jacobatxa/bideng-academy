export function LanternMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="48%">
          <stop offset="0%" stopColor="#F8D48A" />
          <stop offset="70%" stopColor="#E3942C" />
          <stop offset="100%" stopColor="#C46A12" />
        </radialGradient>
      </defs>
      <rect x="28" y="6" width="8" height="6" rx="1.5" fill="#1C1710" />
      <path
        d="M18 18c0-5 6.5-8 14-8s14 3 14 8v20c0 7-6.5 12-14 12s-14-5-14-12V18z"
        fill="url(#glow)"
      />
      <path
        d="M22 20c1.5 10 4 16 10 22"
        stroke="#FFF4DC"
        strokeOpacity=".35"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        className="flame-breathe"
        d="M32 26c4 5 5 9 0 14-5-5-4-9 0-14z"
        fill="#D24A16"
      />
      <rect x="16" y="17" width="32" height="5" rx="2.5" fill="#1C1710" />
      <rect x="20" y="49" width="24" height="4" rx="2" fill="#1C1710" />
      <path d="M32 53v5" stroke="#1C1710" strokeWidth="2" />
    </svg>
  );
}
