import { createFileRoute } from "@tanstack/react-router";
import { InstructorLayout } from "./layout";

export const Route = createFileRoute("/instructor/students")({
  component: InstructorStudents,
  head: () => ({
    meta: [
      { title: "Student Management - Instructor Dashboard" },
    ],
  }),
});

function InstructorStudents() {
  return (
    <InstructorLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Student Management
        </h1>
        <p style={{ color: "#d0dcc8" }}>Track and manage all your students across courses.</p>
      </div>
    </InstructorLayout>
  );
}
