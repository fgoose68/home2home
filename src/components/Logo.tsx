export default function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  const s = size;
  return (
    <div className="flex items-center gap-3">
      <svg
        width={s}
        height={s}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="H2H Logo"
      >
        {/* Left house */}
        <g>
          <polygon points="4,38 18,22 32,38" fill="#1a5276" />
          <rect x="8" y="38" width="20" height="16" fill="#2980b9" rx="1" />
          <rect x="14" y="44" width="8" height="10" fill="#85c1e9" rx="1" />
          <rect x="16" y="40" width="4" height="4" fill="#aed6f1" rx="0.5" />
        </g>

        {/* Right house */}
        <g>
          <polygon points="48,38 62,22 76,38" fill="#922b21" />
          <rect x="52" y="38" width="20" height="16" fill="#e74c3c" rx="1" />
          <rect x="58" y="44" width="8" height="10" fill="#f5b7b1" rx="1" />
          <rect x="60" y="40" width="4" height="4" fill="#fadbd8" rx="0.5" />
        </g>

        {/* Palm tree on center "2" shape */}
        {/* Trunk */}
        <path d="M39 62 Q38 52 40 44 Q41 38 39 32" stroke="#8d6e47" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Palm fronds */}
        <path d="M39 34 Q30 28 26 24" stroke="#2ecc71" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M39 34 Q34 26 36 20" stroke="#27ae60" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M39 34 Q44 26 44 20" stroke="#2ecc71" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M39 34 Q48 28 52 24" stroke="#27ae60" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M39 34 Q40 27 42 22" stroke="#2ecc71" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Coconuts */}
        <circle cx="38" cy="36" r="2" fill="#c8860a" />
        <circle cx="41" cy="37" r="1.5" fill="#b5770a" />
        {/* Base/ground */}
        <ellipse cx="39" cy="62" rx="6" ry="2" fill="#c8b89a" opacity="0.7" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-black text-2xl tracking-tight text-slate-800">
            h<span className="text-amber-600">2</span>h
          </span>
          <span className="text-xs font-medium tracking-widest text-slate-500 uppercase">
            home2home
          </span>
        </div>
      )}
    </div>
  );
}
