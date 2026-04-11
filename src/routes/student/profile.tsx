import { createFileRoute } from "@tanstack/react-router";
import { StudentLayout } from "./layout";

export const Route = createFileRoute("/student/profile")({
  component: StudentProfile,
  head: () => ({
    meta: [
      { title: "Profile - Student Dashboard" },
    ],
  }),
});

function StudentProfile() {
  return (
    <StudentLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Profile
        </h1>
        <p style={{ color: "#d0dcc8" }}>Manage your account settings and personal information.</p>
      </div>
    </StudentLayout>
  );
}
