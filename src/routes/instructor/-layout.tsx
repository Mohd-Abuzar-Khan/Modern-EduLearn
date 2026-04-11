import { Outlet, Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";

export function InstructorLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { label: "Dashboard", path: "/instructor" },
    { label: "Courses", path: "/instructor/courses" },
    { label: "Student Management", path: "/instructor/students" },
    { label: "Analytics", path: "/instructor/analytics" },
    { label: "Content Library", path: "/instructor/content" },
    { label: "Earnings", path: "/instructor/earnings" },
    { label: "Profile", path: "/instructor/profile" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#1a2e1a" }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "280px" : "0",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          transition: "width 0.3s ease",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "28px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            EduLearn
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: "20px 0", overflow: "auto" }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "block",
                padding: "14px 20px",
                color: isActive(item.path) ? "#ffffff" : "#d0dcc8",
                textDecoration: "none",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: isActive(item.path) ? 500 : 400,
                borderLeft: isActive(item.path) ? "3px solid #6aaa6a" : "3px solid transparent",
                background: isActive(item.path) ? "rgba(106,170,106,0.1)" : "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#d0dcc8";
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <button
            style={{
              padding: "10px 16px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "#d0dcc8",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#d0dcc8";
            }}
          >
            Settings
          </button>
          <button
            style={{
              padding: "10px 16px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#d0dcc8",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#d0dcc8";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 40px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              fontSize: "24px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ☰
          </button>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#d0dcc8",
                fontSize: "18px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#d0dcc8";
              }}
            >
              🔔
            </button>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(106,170,106,0.4) 0%, rgba(74,154,138,0.2) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              👤
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "40px" }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>
    </div>
  );
}
