"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvailableCourseCard from "@/components/student/AvailableCourseCard";
import CourseDetailsModal from "@/components/student/CourseDetailsModal";

export default function StudentEnroll() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/students/course-sections",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load available courses."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid course data received from server.");
      }

      setCourses(data);
    } catch (err) {
      setError(
        err.message || "Unable to load available courses."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEnrollmentSuccess(courseSectionId) {
    setCourses((currentCourses) =>
      currentCourses.map((course) =>
        course.course_section_id === courseSectionId
          ? {
              ...course,
              is_enrolled: true,
            }
          : course
      )
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading available courses...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadCourses}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Academics
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Enroll in Courses
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Browse available course sections and enroll in
            the ones that fit your schedule.
          </p>
        </section>

        {courses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="font-semibold text-slate-900">
              No courses available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no course sections available
              for enrollment.
            </p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <AvailableCourseCard
                key={course.course_section_id}
                course={course}
                onEnrollmentSuccess={handleEnrollmentSuccess}
                onOpenDetails={() => setSelectedCourse(course)}
              />
            ))}
          </section>
        )}
      </div>

      <CourseDetailsModal
        course={selectedCourse}
        open={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </main>
  );
}