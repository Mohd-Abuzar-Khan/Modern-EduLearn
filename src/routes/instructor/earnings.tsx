import { createFileRoute } from "@tanstack/react-router";
import { InstructorLayout } from "./layout";

export const Route = createFileRoute("/instructor/earnings")({
  component: InstructorEarnings,
  head: () => ({
    meta: [
      { title: "Earnings - Instructor Dashboard" },
    ],
  }),
});

function InstructorEarnings() {
  return (
    <InstructorLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Earnings
        </h1>
        <p style={{ color: "#d0dcc8" }}>Track your earnings and revenue from all your courses.</p>
      </div>
    </InstructorLayout>
  );
}
