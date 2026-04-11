import { createFileRoute } from "@tanstack/react-router";
import { InstructorLayout } from "./layout";

export const Route = createFileRoute("/instructor/analytics")({
  component: InstructorAnalytics,
  head: () => ({
    meta: [
      { title: "Analytics - Instructor Dashboard" },
    ],
  }),
});

function InstructorAnalytics() {
  return (
    <InstructorLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Analytics
        </h1>
        <p style={{ color: "#d0dcc8" }}>View detailed statistics and insights about your courses.</p>
      </div>
    </InstructorLayout>
  );
}
