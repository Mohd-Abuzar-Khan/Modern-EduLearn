import { createFileRoute } from "@tanstack/react-router";
import { StudentLayout } from "./-layout";

export const Route = createFileRoute("/student/quizzes")({
  component: StudentQuizzes,
  head: () => ({
    meta: [
      { title: "Quizzes - Student Dashboard" },
    ],
  }),
});

function StudentQuizzes() {
  return (
    <StudentLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Quizzes
        </h1>
        <p style={{ color: "#d0dcc8" }}>Test your knowledge with interactive quizzes and assessments.</p>
      </div>
    </StudentLayout>
  );
}
