import { createFileRoute } from "@tanstack/react-router";
import { InstructorLayout } from "./-layout";

export const Route = createFileRoute("/instructor/courses")({
  component: InstructorCourses,
  head: () => ({
    meta: [
      { title: "Course Management - Instructor Dashboard" },
    ],
  }),
});

function InstructorCourses() {
  const courses = [
    {
      id: 1,
      title: "Advanced Web Design",
      status: "published",
      students: 324,
      lessons: 24,
      revenue: "$2,450",
      lastUpdated: "2 days ago",
    },
    {
      id: 2,
      title: "Full Stack Development",
      status: "published",
      students: 456,
      lessons: 32,
      revenue: "$3,200",
      lastUpdated: "1 week ago",
    },
    {
      id: 3,
      title: "UI/UX Design Masterclass",
      status: "draft",
      students: 0,
      lessons: 18,
      revenue: "$0",
      lastUpdated: "Today",
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "published" 
      ? { bg: "rgba(106,170,106,0.15)", color: "#8cd08c", label: "Published" }
      : { bg: "rgba(106,170,106,0.05)", color: "#6aaa6a", label: "Draft" };
  };

  return (
    <InstructorLayout>
      <div style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
              My Courses
            </h1>
            <p style={{ fontSize: "16px", color: "#d0dcc8" }}>
              Manage and track all your courses
            </p>
          </div>
          <button
            style={{
              padding: "12px 28px",
              background: "#ffffff",
              color: "#1a2e1a",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
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
            + Create New Course
          </button>
        </div>

        {/* Courses Table */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#8a9a80",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Course Title
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#8a9a80",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#8a9a80",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Students
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#8a9a80",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Revenue
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#8a9a80",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Last Updated
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "right",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#8a9a80",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const statusStyle = getStatusColor(course.status);
                return (
                  <tr
                    key={course.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", marginBottom: "4px" }}>
                          {course.title}
                        </p>
                        <p style={{ fontSize: "12px", color: "#8a9a80" }}>
                          {course.lessons} lessons
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>
                        {course.students}
                      </p>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#8cd08c" }}>
                        {course.revenue}
                      </p>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <p style={{ fontSize: "13px", color: "#d0dcc8" }}>
                        {course.lastUpdated}
                      </p>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "#6aaa6a",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "color 0.2s ease",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#8cd08c";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#6aaa6a";
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </InstructorLayout>
  );
}
