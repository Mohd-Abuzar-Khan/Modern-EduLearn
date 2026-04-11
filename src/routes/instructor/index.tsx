import { createFileRoute } from "@tanstack/react-router";
import { InstructorLayout } from "./-layout";

export const Route = createFileRoute("/instructor/")({
  component: InstructorDashboard,
  head: () => ({
    meta: [
      { title: "Dashboard - Instructor Dashboard" },
      { name: "description", content: "Your instructor dashboard on EduLearn" },
    ],
  }),
});

function InstructorDashboard() {
  const stats = [
    { label: "Active Courses", value: "5" },
    { label: "Total Students", value: "1,245" },
    { label: "Monthly Earnings", value: "$8,500" },
    { label: "Avg. Rating", value: "4.8★" },
  ];

  const recentCourses = [
    {
      id: 1,
      title: "Advanced Web Design",
      students: 324,
      earnings: "$2,450",
      rating: 4.9,
      image: "linear-gradient(135deg, #2a5a3a 0%, #4a8a5a 40%, #c8dca0 100%)",
    },
    {
      id: 2,
      title: "Full Stack Development",
      students: 456,
      earnings: "$3,200",
      rating: 4.7,
      image: "linear-gradient(135deg, #1a3a2a 0%, #3a6a4a 50%, #6aaa7a 100%)",
    },
    {
      id: 3,
      title: "UI/UX Design Masterclass",
      students: 289,
      earnings: "$2,050",
      rating: 4.8,
      image: "linear-gradient(135deg, #2a4a3a 0%, #5a8a6a 40%, #e8f0d8 100%)",
    },
  ];

  return (
    <InstructorLayout>
      <div style={{ maxWidth: "1400px" }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "8px",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Welcome back, Instructor!
          </h1>
          <p style={{ fontSize: "16px", color: "#d0dcc8" }}>
            Manage your courses and track your student progress
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "16px",
                padding: "24px",
                backdropFilter: "blur(16px)",
              }}
            >
              <p style={{ fontSize: "13px", color: "#8a9a80", marginBottom: "8px", textTransform: "uppercase" }}>
                {stat.label}
              </p>
              <h3 style={{ fontSize: "28px", fontWeight: 600, color: "#ffffff" }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Courses Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#ffffff" }}>
              Your Courses
            </h2>
            <button
              style={{
                padding: "10px 20px",
                background: "rgba(106,170,106,0.2)",
                border: "1px solid rgba(106,170,106,0.4)",
                borderRadius: "8px",
                color: "#8cd08c",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(106,170,106,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(106,170,106,0.2)";
              }}
            >
              + New Course
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {recentCourses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 24px 64px rgba(0,0,0,0.35)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              >
                {/* Course Image */}
                <div
                  style={{
                    height: "140px",
                    background: course.image,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.06,
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                      backgroundSize: "128px 128px",
                    }}
                  />
                </div>

                {/* Course Info */}
                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: "12px",
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </h3>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#8a9a80", textTransform: "uppercase" }}>Students</p>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff" }}>{course.students}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#8a9a80", textTransform: "uppercase" }}>Rating</p>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "#8cd08c" }}>{course.rating}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#8a9a80", textTransform: "uppercase" }}>Earnings</p>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff" }}>{course.earnings}</p>
                    </div>
                  </div>

                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "rgba(106,170,106,0.2)",
                      border: "1px solid rgba(106,170,106,0.4)",
                      borderRadius: "8px",
                      color: "#8cd08c",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(106,170,106,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(106,170,106,0.2)";
                    }}
                  >
                    Manage Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
