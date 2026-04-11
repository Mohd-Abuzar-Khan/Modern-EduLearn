import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/course/$courseId")({
  component: CourseDetail,
});

function CourseDetail() {
  const params = Route.useSearch() as { courseId: string };
  const [selectedSection, setSelectedSection] = useState(0);

  const courseData = {
    id: 1,
    title: "Visual Design Foundations",
    instructor: "Aria Chen",
    rating: 4.9,
    students: 1250,
    price: "$49",
    image: "linear-gradient(135deg, #2a5a3a 0%, #4a8a5a 40%, #c8dca0 100%)",
    description: "Master the fundamentals of visual hierarchy, color theory, and layout in this comprehensive course.",
    longDescription: "Learn from industry expert Aria Chen as she takes you through the essential principles of visual design. From understanding color psychology to creating balanced layouts, you'll develop skills that matter.",
    sections: [
      {
        id: 1,
        title: "Getting Started",
        lessons: [
          { id: 1, title: "Welcome to the Course", duration: "5 min" },
          { id: 2, title: "Course Overview", duration: "8 min" },
          { id: 3, title: "Setting Up Your Tools", duration: "12 min" },
        ],
      },
      {
        id: 2,
        title: "Design Fundamentals",
        lessons: [
          { id: 4, title: "Understanding Color Theory", duration: "15 min" },
          { id: 5, title: "Typography Basics", duration: "18 min" },
          { id: 6, title: "Visual Hierarchy", duration: "14 min" },
        ],
      },
      {
        id: 3,
        title: "Layout & Composition",
        lessons: [
          { id: 7, title: "Grid Systems", duration: "16 min" },
          { id: 8, title: "Whitespace & Balance", duration: "12 min" },
          { id: 9, title: "Creating Dynamic Layouts", duration: "20 min" },
        ],
      },
      {
        id: 4,
        title: "Practical Projects",
        lessons: [
          { id: 10, title: "Project 1: Brand Design", duration: "45 min" },
          { id: 11, title: "Project 2: Web Design", duration: "50 min" },
          { id: 12, title: "Final Project & Review", duration: "60 min" },
        ],
      },
    ],
  };

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
          padding: "16px 40px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href="/explore"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "16px",
            color: "#d0dcc8",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          ← Back to Courses
        </a>
        <a
          href="/"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "18px",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          EduLearn
        </a>
      </div>

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 350px",
              gap: "40px",
              marginBottom: "60px",
            }}
          >
            {/* Left Column */}
            <div>
              {/* Course Hero Image */}
              <div
                style={{
                  height: "400px",
                  background: courseData.image,
                  borderRadius: "16px",
                  marginBottom: "32px",
                  position: "relative",
                  overflow: "hidden",
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
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 600,
                  color: "#ffffff",
                  marginBottom: "16px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {courseData.title}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginBottom: "32px",
                  paddingBottom: "32px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <p style={{ fontSize: "12px", color: "#8a9a80", marginBottom: "4px" }}>Instructor</p>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>{courseData.instructor}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8a9a80", marginBottom: "4px" }}>Rating</p>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>⭐ {courseData.rating}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8a9a80", marginBottom: "4px" }}>Students</p>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>{courseData.students.toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "48px" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#ffffff",
                    marginBottom: "16px",
                  }}
                >
                  About this course
                </h2>
                <p style={{ fontSize: "15px", color: "#d0dcc8", lineHeight: 1.8, marginBottom: "16px" }}>
                  {courseData.longDescription}
                </p>
                <p style={{ fontSize: "14px", color: "#d0dcc8", lineHeight: 1.8 }}>
                  Throughout this course, you'll work on real-world projects that showcase your new skills. By the end, you'll have a portfolio piece that demonstrates your understanding of visual design principles.
                </p>
              </div>

              {/* Curriculum */}
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#ffffff",
                    marginBottom: "24px",
                  }}
                >
                  Course Curriculum
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {courseData.sections.map((section, sectionIndex) => (
                    <div key={section.id}>
                      <button
                        onClick={() => setSelectedSection(selectedSection === sectionIndex ? -1 : sectionIndex)}
                        style={{
                          width: "100%",
                          padding: "16px",
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "12px",
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        }}
                      >
                        <div>
                          <span>{section.title}</span>
                          <span style={{ fontSize: "12px", color: "#8a9a80", marginLeft: "12px" }}>
                            {section.lessons.length} lessons
                          </span>
                        </div>
                        <span style={{ transform: selectedSection === sectionIndex ? "rotate(180deg)" : "rotate(0)" }}>
                          ▼
                        </span>
                      </button>

                      {selectedSection === sectionIndex && (
                        <div style={{ paddingLeft: "16px", marginTop: "8px" }}>
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              style={{
                                padding: "12px 16px",
                                borderLeft: "2px solid rgba(106,170,106,0.3)",
                                color: "#d0dcc8",
                                fontSize: "13px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.borderLeftColor = "rgba(106,170,106,0.6)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#d0dcc8";
                                e.currentTarget.style.borderLeftColor = "rgba(106,170,106,0.3)";
                              }}
                            >
                              <span>▶ {lesson.title}</span>
                              <span style={{ fontSize: "11px", color: "#8a9a80" }}>{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Enrollment Card */}
            <div>
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  padding: "28px",
                  backdropFilter: "blur(16px)",
                  position: "sticky",
                  top: "40px",
                }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#8a9a80",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Course Price
                  </span>
                  <h3
                    style={{
                      fontSize: "36px",
                      fontWeight: 700,
                      color: "#8cd08c",
                      marginTop: "8px",
                    }}
                  >
                    {courseData.price}
                  </h3>
                </div>

                <button
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#ffffff",
                    color: "#1a2e1a",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: "pointer",
                    marginBottom: "12px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Enroll Now
                </button>

                <button
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "rgba(255,255,255,0.1)",
                    color: "#d0dcc8",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                >
                  Add to Wishlist
                </button>

                <div
                  style={{
                    marginTop: "28px",
                    paddingTop: "28px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#d0dcc8",
                      marginBottom: "16px",
                      textTransform: "uppercase",
                    }}
                  >
                    What You'll Learn
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {[
                      "Master color theory and psychology",
                      "Create balanced visual hierarchies",
                      "Design professional layouts",
                      "Build your design portfolio",
                    ].map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "13px",
                          color: "#d0dcc8",
                          marginBottom: "12px",
                          paddingLeft: "24px",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            color: "#8cd08c",
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
