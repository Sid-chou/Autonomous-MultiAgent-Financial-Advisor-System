"use client";

interface NavbarProps {
  onProfileClick: () => void;
  profileSet: boolean;
}

export function Navbar({ onProfileClick, profileSet }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center justify-center"
      style={{ background: "transparent" }}>

      {/* Centered container — matches Finta's contained width */}
      <div className="w-full max-w-[1100px] mx-auto px-8 flex items-center justify-between">

        {/* Logo */}
        <span className="font-display text-[20px] tracking-tight"
          style={{ color: "#0F172A" }}>
          FinAdvisor
        </span>

        {/* Right side — all nav items here */}
        <div className="flex items-center gap-8">

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <span className="font-sans text-[15px] font-medium cursor-pointer transition-colors"
              style={{ color: "#0F172A" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#082F49")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0F172A")}>
              Features
            </span>
            <span className="font-sans text-[15px] font-medium cursor-pointer transition-colors"
              style={{ color: "#0F172A" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#082F49")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0F172A")}>
              How it works
            </span>
            <span className="font-sans text-[15px] font-medium cursor-pointer transition-colors"
              style={{ color: "#0F172A" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#082F49")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0F172A")}>
              Demo
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Profile button */}
            <button
              onClick={onProfileClick}
              className="relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{
                background: "rgba(8, 47, 73, 0.08)",
                border: "1px solid rgba(8, 47, 73, 0.2)",
              }}
              title="Risk Profile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#082F49" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              {profileSet && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: "#082F49", border: "1.5px solid #ffffff" }} />
              )}
            </button>

            {/* CTA */}
            <button
              className="font-sans text-[14px] font-medium px-5 py-2 rounded-[8px] transition-colors"
              style={{ background: "#082F49", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0F172A")}
              onMouseLeave={e => (e.currentTarget.style.background = "#082F49")}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}