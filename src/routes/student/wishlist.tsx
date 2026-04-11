import { createFileRoute } from "@tanstack/react-router";
import { StudentLayout } from "./layout";

export const Route = createFileRoute("/student/wishlist")({
  component: StudentWishlist,
  head: () => ({
    meta: [
      { title: "Wishlist - Student Dashboard" },
    ],
  }),
});

function StudentWishlist() {
  return (
    <StudentLayout>
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Wishlist
        </h1>
        <p style={{ color: "#d0dcc8" }}>Save your favorite courses to take them later.</p>
      </div>
    </StudentLayout>
  );
}
