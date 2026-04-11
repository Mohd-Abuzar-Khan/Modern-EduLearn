import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/explore")({
  component: ExploreCourses,
  head: () => ({
    meta: [
      { title: "Explore Courses - EduLearn" },
      { name: "description", content: "Browse and discover world-class courses on EduLearn" },
    ],
  }),
});

function ExploreCourses() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    "All",
    "Design",
    "Development",
    "Business",
    "Marketing",
    "Photography",
  ];

  const courses = [
    {
      id: 1,
      title: "Visual Design Foundations",
      instructor: "Aria Chen",
      badge: "Beginner",
      price: "$49",
      rating: 4.9,
      students: 1250,
      image: "linear-gradient(135deg, #2a5a3a 0%, #4a8a5a 40%, #c8dca0 100%)",
      description: "Master the fundamentals of visual hierarchy, color theory, and layout.",
      category: "Design",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      instructor: "Marcus Webb",
      badge: "Advanced",
      price: "$79",
      rating: 4.8,
      students: 856,
      image: "linear-gradient(135deg, #1a3a2a 0%, #3a6a4a 50%, #6aaa7a 100%)",
      description: "Deep dive into compound components, render props, and state machines.",
      category: "Development",
    },
    {
      id: 3,
      title: "Motion & Interaction",
      instructor: "Lina Park",
      badge: "Intermediate",
      price: "$59",
      rating: 4.7,
      students: 945,
      image: "linear-gradient(135deg, #2a4a3a 0%, #5a8a6a 40%, #e8f0d8 100%)",
      description: "Create delightful animations and micro-interactions for the web.",
      category: "Design",
    },
    {
      id: 4,
      title: "Brand Identity Systems",
      instructor: "James Osei",
      badge: "Beginner",
      price: "$49",
      rating: 4.6,
      students: 782,
      image: "linear-gradient(135deg, #1a4a2a 0%, #4a7a5a 50%, #a0d0a0 100%)",
      description: "Build cohesive brand systems from logo to full guidelines.",
      category: "Design",
    },
    {
      id: 5,
      title: "Digital Marketing Mastery",
      instructor: "Sarah Mitchell",
      badge: "Intermediate",
      price: "$69",
      rating: 4.8,
      students: 1102,
      image: "linear-gradient(135deg, #2a3a4a 0%, #4a6a7a 50%, #8ab0ba 100%)",
      description: "Learn modern digital marketing strategies and tactics.",
      category: "Marketing",
    },
    {
      id: 6,
      title: "Photography Essentials",
      instructor: "David Wong",
      badge: "Beginner",
      price: "$39",
      rating: 4.9,
      students: 1584,
      image: "linear-gradient(135deg, #3a2a1a 0%, #6a5a3a 50%, #c0a080 100%)",
      description: "Master composition, lighting, and post-processing techniques.",
      category: "Photography",
    },
  ];

  const filteredCourses = selectedCategory && selectedCategory !== "All"
    ? courses.filter((c) => c.category === selectedCategory)
    : courses;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #1a2e1a 0%, #2a4a2a 50%, #1a2e1a 100%)`,
        backgroundAttachment: "fixed",
        fontFamily: "'DM Sans', 'Space Grotesk', sans-serif",
        position: "relative",
      }}
    >
      {/* Grain texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.03,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "28px 48px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "20px",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          EduLearn
        </a>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <a href="/" style={{ color: "#d0dcc8", textDecoration: "none", fontSize: "13px" }}>Home</a>
          <a href="/explore" style={{ color: "#ffffff", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>
            Courses
          </a>
          <a
            href="/auth/signin"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 20px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "999px",
            }}
          >
            Sign In
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "48px 40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Page Title */}
          <div style={{ marginBottom: "48px" }}>
            <h1
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "12px",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Explore Courses
            </h1>
            <p style={{ fontSize: "16px", color: "#d0dcc8", maxWidth: "600px" }}>
              Discover world-class courses taught by industry experts
            </p>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "40px", overflowX: "auto", paddingBottom: "8px" }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === "All" ? null : category)}
                style={{
                  padding: "10px 24px",
                  background:
                    (!selectedCategory && category === "All") || selectedCategory === category
                      ? "rgba(106,170,106,0.3)"
                      : "rgba(255,255,255,0.08)",
                  border:
                    (!selectedCategory && category === "All") || selectedCategory === category
                      ? "1px solid rgba(106,170,106,0.5)"
                      : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color:
                    (!selectedCategory && category === "All") || selectedCategory === category
                      ? "#8cd08c"
                      : "#d0dcc8",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (
                    !((!selectedCategory && category === "All") || selectedCategory === category)
                  ) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !((!selectedCategory && category === "All") || selectedCategory === category)
                  ) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredCourses.map((course) => (
              <a
                key={course.id}
                href={`/course/${course.id}`}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
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
                    height: "160px",
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
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      display: "inline-block",
                      padding: "5px 14px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: "rgba(106,170,106,0.18)",
                      color: "#8cd08c",
                      border: "1px solid rgba(106,170,106,0.30)",
                    }}
                  >
                    {course.badge}
                  </span>
                </div>

                {/* Course Info */}
                <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: "8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#d0dcc8",
                      lineHeight: 1.5,
                      marginBottom: "12px",
                      flex: 1,
                    }}
                  >
                    {course.description}
                  </p>
                  <p style={{ fontSize: "12px", color: "#8a9a80", marginBottom: "16px" }}>
                    {course.instructor}
                  </p>

                  {/* Rating and Students */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "#d0dcc8",
                      marginBottom: "16px",
                    }}
                  >
                    <span>⭐ {course.rating}</span>
                    <span>{course.students.toLocaleString()} students</span>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#8cd08c",
                      }}
                    >
                      {course.price}
                    </span>
                    <button
                      style={{
                        padding: "8px 16px",
                        background: "rgba(106,170,106,0.2)",
                        border: "1px solid rgba(106,170,106,0.4)",
                        borderRadius: "6px",
                        color: "#8cd08c",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.background = "rgba(106,170,106,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(106,170,106,0.2)";
                      }}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
