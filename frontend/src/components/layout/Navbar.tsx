"use client";

interface NavbarProps {
  onProfileClick: () => void;
  profileSet: boolean;
}

export function Navbar({ onProfileClick, profileSet }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center justify-center max-w-3xl mx-auto backdrop -blur-2xl bg-white/90 border-b border-white/100"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>

      {/* Centered container — matches Finta's contained width */}
      <div className="w-full max-w-[1100px] mx-auto px-8 flex items-center justify-between">

        {/* Full Logo — icon + wordmark */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          {/* Icon badge */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M19 6.873a2 2 0 0 1 1 1.747v6.536a2 2 0 0 1 -1.029 1.748l-6 3.833a2 2 0 0 1 -1.942 0l-6 -3.833a2 2 0 0 1 -1.029 -1.747v-6.537a2 2 0 0 1 1.029 -1.748l6 -3.572a2.056 2.056 0 0 1 2 0l6 3.573z" />
              <path d="M9 15v-4" />
              <path d="M12 15v-7" />
              <path d="M15 15v-2" />
            </svg>
          </div>
          {/* Wordmark */}
          <span
            className="text-[18px] font-semibold tracking-tight"
            style={{ color: "#0F172A", letterSpacing: "-0.02em" }}
          >
            Fin<span style={{ color: "#2563EB" }}>Advisor</span>
          </span>
        </div>

        {/* Right side — all nav items here */}
        <div className="flex items-center gap-4">

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <span className="text-[14px] font-semibold  cursor-pointer transition-colors" 
              style={{ color: "#0F172A" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#082F49")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0F172A")}>
              Features
            </span>
            {/* <span className="text-[14px] font-semibold cursor-pointer font-weight:400 transition-colors"
              style={{ color: "#0F172A" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#082F49")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0F172A")}>
              How it works
            </span> */}
            <span className="text-[14px] font-semibold cursor-pointer transition-colors"
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
            {/* <button
              className="font-sans text-[14px] font-medium px-5 py-2 rounded-[8px] transition-colors"
              style={{ background: "#082F49", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0F172A")}
              onMouseLeave={e => (e.currentTarget.style.background = "#082F49")}>
              Get Started
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
}