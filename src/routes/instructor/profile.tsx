import { createFileRoute } from "@tanstack/react-router";
import { InstructorLayout } from "./-layout";

export const Route = createFileRoute("/instructor/profile")({
  component: InstructorProfile,
  head: () => ({
    meta: [
      { title: "Profile - Instructor Dashboard" },
    ],
  }),
});

function InstructorProfile() {
  return (
    <InstructorLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Profile
        </h1>
        <p style={{ color: "#d0dcc8" }}>Manage your instructor profile and settings.</p>
      </div>
    </InstructorLayout>
  );
}
