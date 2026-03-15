"use client";

interface NavbarProps {
  onProfileClick: () => void;
  profileSet: boolean;
}

export function Navbar({ onProfileClick, profileSet }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] px-8 flex items-center justify-between"
      style={{
        background: "rgba(2, 6, 23, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(125, 211, 252, 0.08)",
      }}>

      {/* Logo */}
      <span className="font-display text-xl text-alice tracking-tight">
        FinAdvisor
      </span>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-frozen opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
          How It Works
        </span>
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-frozen opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
          Demo
        </span>

        {/* Profile button */}
        <button
          onClick={onProfileClick}
          className="relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          style={{
            background: "rgba(8, 47, 73, 0.6)",
            border: "1px solid rgba(125, 211, 252, 0.2)",
          }}
          title="Risk Profile">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          {profileSet && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-frozen"
              style={{ border: "1.5px solid #020617" }} />
          )}
        </button>
      </div>
    </nav>
  );
}
