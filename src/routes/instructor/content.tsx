import { createFileRoute } from "@tanstack/react-router";
import { InstructorLayout } from "./-layout";

export const Route = createFileRoute("/instructor/content")({
  component: InstructorContent,
  head: () => ({
    meta: [
      { title: "Content Library - Instructor Dashboard" },
    ],
  }),
});

function InstructorContent() {
  return (
    <InstructorLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Content Library
        </h1>
        <p style={{ color: "#d0dcc8" }}>Manage and organize all your course materials and resources.</p>
      </div>
    </InstructorLayout>
  );
}
