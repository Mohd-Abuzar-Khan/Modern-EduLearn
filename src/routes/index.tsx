import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Verdant — Premium E-Learning Platform" },
      { name: "description", content: "Unlock your potential with immersive, world-class courses designed by industry leaders." },
    ],
  }),
});

function Index() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const totalSections = 4;

  const scrollToSection = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(index, totalSections - 1));
    const target = scrollRef.current.children[clamped] as HTMLElement | undefined;
    if (target) {
      scrollRef.current.scrollLeft = target.offsetLeft;
    }
    setCurrentSection(clamped);
  }, []);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const containerWidth = scrollRef.current.offsetWidth;
      if (containerWidth === 0) return;
      const idx = Math.round(scrollRef.current.scrollLeft / containerWidth);
      setCurrentSection(idx);
    }, 100);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --el-bg-deep: #1a2e1a;
          --el-bg-teal: #2a4a2a;
          --el-bg-mid: #3a5a3a;
          --el-glow-teal: #4a7a4a;
          --el-glow-cream: #e8f0e0;
          --el-glow-warm: #c8dca0;
          --el-text-primary: #ffffff;
          --el-text-secondary: #d0dcc8;
          --el-text-muted: #8a9a80;
          --el-card-bg: rgba(255,255,255,0.10);
          --el-card-border: rgba(255,255,255,0.18);
          --el-glass-bg: rgba(255,255,255,0.12);
          --el-input-bg: rgba(255,255,255,0.10);
          --el-input-border: rgba(255,255,255,0.22);
          --el-accent: #6aaa6a;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { overflow: hidden; width: 100vw; height: 100vh; }

        .el-scroll-container {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          width: 100vw;
          height: 100vh;
          -ms-overflow-style: none;
          scrollbar-width: none;
          background-image: url('https://i.pinimg.com/736x/c0/29/b8/c029b8e8e707cc5ce832e177a6beb6ef.jpg');
          background-size: 400vw 100vh;
          background-position: left center;
          background-repeat: no-repeat;
        }
        .el-scroll-container::-webkit-scrollbar { display: none; }

        .el-section {
          min-width: 100vw;
          width: 100vw;
          height: 100vh;
          scroll-snap-align: start;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
        }

        .el-grain {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px 128px;
          z-index: 1;
        }

        .el-heading {
          font-family: 'Space Grotesk', sans-serif;
          color: var(--el-text-primary);
          letter-spacing: -0.03em;
          line-height: 1.08;
          font-weight: 500;
        }

        @keyframes el-fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes el-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes el-pulse {
          0%, 100% { opacity: 0.4; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(6px); }
        }
        @keyframes el-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8px, -14px) scale(1.02); }
        }
        @keyframes el-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .el-fade-1 { animation: el-fadeUp 1s ease-out 0.2s both; }
        .el-fade-2 { animation: el-fadeUp 1s ease-out 0.5s both; }
        .el-fade-3 { animation: el-fadeUp 1s ease-out 0.8s both; }
        .el-fade-4 { animation: el-fadeIn 1.2s ease-out 1.2s both; }

        .el-card {
          background: var(--el-card-bg);
          border: 1px solid var(--el-card-border);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }
        .el-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.35), 0 0 48px rgba(74,154,138,0.1);
          border-color: rgba(255,255,255,0.16);
        }

        .el-badge {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(106,170,106,0.18);
          color: #8cd08c;
          border: 1px solid rgba(106,170,106,0.30);
          font-family: 'DM Sans', sans-serif;
        }

        .el-input {
          width: 100%;
          padding: 14px 16px;
          background: var(--el-input-bg);
          border: 1px solid var(--el-input-border);
          border-radius: 12px;
          color: var(--el-text-primary);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .el-input::placeholder { color: var(--el-text-muted); }
        .el-input:focus {
          border-color: var(--el-accent);
          box-shadow: 0 0 0 3px rgba(74,154,138,0.12);
        }

        .el-btn {
          width: 100%;
          padding: 14px;
          background: var(--el-text-primary);
          color: var(--el-bg-deep);
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .el-btn:hover { background: #fff; transform: translateY(-1px); }

        .el-nav-link {
          color: var(--el-text-secondary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.04em;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s ease;
        }
        .el-nav-btn {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--el-text-primary);
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          z-index: 100;
          font-family: 'DM Sans', sans-serif;
        }
        .el-nav-btn:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-50%) scale(1.08);
        }
        .el-nav-btn:disabled {
          opacity: 0.2;
          pointer-events: none;
        }
        .el-nav-btn--prev { left: 20px; }
        .el-nav-btn--next { right: 20px; }

        .el-dots {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 100;
        }
        .el-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .el-dot--active {
          background: var(--el-text-primary);
          width: 24px;
          border-radius: 4px;
        }
      `}</style>

      {/* Navigation Buttons */}
      <button
        className="el-nav-btn el-nav-btn--prev"
        onClick={() => scrollToSection(currentSection - 1)}
        disabled={currentSection === 0}
        aria-label="Previous section"
      >
        ←
      </button>
      <button
        className="el-nav-btn el-nav-btn--next"
        onClick={() => scrollToSection(currentSection + 1)}
        disabled={currentSection === totalSections - 1}
        aria-label="Next section"
      >
        →
      </button>

      {/* Dot Indicators */}
      <div className="el-dots">
        {Array.from({ length: totalSections }).map((_, i) => (
          <button
            key={i}
            className={`el-dot${i === currentSection ? " el-dot--active" : ""}`}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>

      <div className="el-scroll-container" ref={scrollRef} onScroll={handleScroll}>
        {/* PAGE 1 — HERO */}
        <section
          className="el-section"
          style={{
            background: `
              radial-gradient(ellipse 60% 55% at 60% 40%, rgba(0,0,0,0.15) 0%, transparent 55%),
              rgba(0,0,0,0.25)
            `,
          }}
        >
          <div className="el-grain" />
          {/* Warm orb glow */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              right: "12%",
              width: "50vw",
              height: "50vw",
              maxWidth: "550px",
              maxHeight: "550px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,200,160,0.10) 0%, rgba(200,160,96,0.05) 30%, rgba(74,154,138,0.03) 50%, transparent 70%)",
              filter: "blur(70px)",
              animation: "el-float 10s ease-in-out infinite",
              zIndex: 0,
            }}
          />
          {/* Teal ambient glow */}
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "20%",
              width: "40vw",
              height: "40vw",
              maxWidth: "400px",
              maxHeight: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(74,154,138,0.06) 0%, transparent 60%)",
              filter: "blur(80px)",
              animation: "el-glow 8s ease-in-out infinite",
              zIndex: 0,
            }}
          />
          {/* Nav */}
          <nav
            className="el-fade-1"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "28px 48px",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--el-text-primary)",
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Verdant
            </span>
            <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
              <a href="#" className="el-nav-link">Courses</a>
              <a href="#" className="el-nav-link">About</a>
              <a href="#" className="el-nav-link">Community</a>
              <a
                href="#"
                style={{
                  color: "var(--el-text-primary)",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  padding: "8px 20px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "999px",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.04em",
                }}
              >
                Sign In
              </a>
            </div>
          </nav>
          {/* Hero text */}
          <div
            style={{
              position: "absolute",
              bottom: "16%",
              left: "48px",
              maxWidth: "650px",
              zIndex: 2,
            }}
          >
            <h1 className="el-heading el-fade-2" style={{ fontSize: "clamp(40px, 5.5vw, 68px)", marginBottom: "24px", fontWeight: 500 }}>
              Learn without<br />boundaries.
            </h1>
            <p className="el-fade-3" style={{ fontSize: "16px", color: "var(--el-text-secondary)", lineHeight: 1.7, maxWidth: "440px", fontFamily: "'DM Sans', sans-serif" }}>
              Immersive courses crafted by world-class creators. Unlock your potential in design, code, and beyond.
            </p>
          </div>
          {/* Scroll indicator */}
          <div
            className="el-fade-4"
            style={{
              position: "absolute",
              bottom: "36px",
              right: "48px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--el-text-muted)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              zIndex: 2,
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase",
            }}
          >
            <span>Scroll</span>
            <span style={{ animation: "el-pulse 2s ease-in-out infinite", display: "inline-block" }}>→</span>
          </div>
        </section>

        {/* PAGE 2 — ABOUT */}
        <section
          className="el-section"
          style={{
            background: `rgba(0,0,0,0.30)`,
            display: "flex",
            alignItems: "center",
            padding: "0 clamp(48px, 8vw, 140px)",
          }}
        >
          <div className="el-grain" />
          <div style={{ maxWidth: "680px", zIndex: 2 }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--el-accent)",
                marginBottom: "24px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              The Platform
            </p>
            <h2 className="el-heading" style={{ fontSize: "clamp(30px, 3.8vw, 48px)", marginBottom: "28px" }}>
              Education reimagined for the modern creative
            </h2>
            <p style={{ fontSize: "15px", color: "var(--el-text-secondary)", lineHeight: 1.75, marginBottom: "16px", maxWidth: "520px", fontFamily: "'DM Sans', sans-serif" }}>
              Verdant brings together the world's most talented instructors with a learning experience that feels alive.
              Every course is designed to be immersive, hands-on, and endlessly rewarding.
            </p>
            <p style={{ fontSize: "14px", color: "var(--el-text-muted)", lineHeight: 1.7, marginBottom: "56px", maxWidth: "520px", fontFamily: "'DM Sans', sans-serif" }}>
              From visual design to full-stack development, our curriculum evolves with industry standards —
              so you're always learning what matters.
            </p>
            {/* Stats */}
            <div style={{ display: "flex", gap: "56px" }}>
              {[
                { value: "12K+", label: "Students" },
                { value: "200+", label: "Courses" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="el-heading" style={{ fontSize: "30px", fontWeight: 500, marginBottom: "4px" }}>{stat.value}</div>
                  <div style={{ fontSize: "12px", color: "var(--el-text-muted)", letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAGE 3 — COURSES */}
        <section
          className="el-section"
          style={{
            background: `rgba(0,0,0,0.28)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 clamp(36px, 5vw, 80px)",
          }}
        >
          <div className="el-grain" />
          <div style={{ zIndex: 2, width: "100%" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--el-accent)",
                marginBottom: "14px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Featured
            </p>
            <h2 className="el-heading" style={{ fontSize: "clamp(26px, 3.2vw, 40px)", marginBottom: "40px" }}>
              Explore Courses
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px" }}>
              {[
                {
                  title: "Visual Design Foundations",
                  instructor: "Aria Chen",
                  badge: "Beginner",
                  gradient: "linear-gradient(135deg, #2a5a3a 0%, #4a8a5a 40%, #c8dca0 100%)",
                  desc: "Master the fundamentals of visual hierarchy, color theory, and layout.",
                },
                {
                  title: "Advanced React Patterns",
                  instructor: "Marcus Webb",
                  badge: "Advanced",
                  gradient: "linear-gradient(135deg, #1a3a2a 0%, #3a6a4a 50%, #6aaa7a 100%)",
                  desc: "Deep dive into compound components, render props, and state machines.",
                },
                {
                  title: "Motion & Interaction",
                  instructor: "Lina Park",
                  badge: "Intermediate",
                  gradient: "linear-gradient(135deg, #2a4a3a 0%, #5a8a6a 40%, #e8f0d8 100%)",
                  desc: "Create delightful animations and micro-interactions for the web.",
                },
                {
                  title: "Brand Identity Systems",
                  instructor: "James Osei",
                  badge: "Beginner",
                  gradient: "linear-gradient(135deg, #1a4a2a 0%, #4a7a5a 50%, #a0d0a0 100%)",
                  desc: "Build cohesive brand systems from logo to full guidelines.",
                },
              ].map((course) => (
                <div key={course.title} className="el-card" style={{ display: "flex", flexDirection: "column" }}>
                  {/* Gradient thumbnail */}
                  <div
                    style={{
                      height: "160px",
                      background: course.gradient,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Inner grain on thumbnail */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.06,
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                      backgroundSize: "128px 128px",
                    }} />
                  </div>
                  {/* Card content */}
                  <div style={{ padding: "22px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <span className="el-badge">{course.badge}</span>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "var(--el-text-primary)",
                        marginTop: "14px",
                        marginBottom: "8px",
                        lineHeight: 1.35,
                        fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {course.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--el-text-muted)", lineHeight: 1.5, marginBottom: "14px", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>
                      {course.desc}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--el-text-secondary)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}>
                      {course.instructor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAGE 4 — LOGIN */}
        <section
          className="el-section"
          style={{
            background: `rgba(0,0,0,0.32)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="el-grain" />
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "44px 36px",
              background: "var(--el-glass-bg)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--el-card-border)",
              borderRadius: "24px",
              zIndex: 2,
            }}
          >
            <h2
              className="el-heading"
              style={{ fontSize: "26px", textAlign: "center", marginBottom: "8px" }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: "13px", color: "var(--el-text-muted)", textAlign: "center", marginBottom: "36px", fontFamily: "'DM Sans', sans-serif" }}>
              Sign in to continue learning
            </p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--el-text-secondary)", marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                  Email
                </label>
                <input type="email" placeholder="you@example.com" className="el-input" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--el-text-secondary)", marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                  Password
                </label>
                <input type="password" placeholder="••••••••" className="el-input" />
              </div>
              <button type="submit" className="el-btn" style={{ marginTop: "8px" }}>
                Sign In
              </button>
            </form>
            <p style={{ fontSize: "13px", color: "var(--el-text-muted)", textAlign: "center", marginTop: "24px", fontFamily: "'DM Sans', sans-serif" }}>
              Don't have an account?{" "}
              <a href="#" style={{ color: "var(--el-accent)", textDecoration: "none" }}>
                Register
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
