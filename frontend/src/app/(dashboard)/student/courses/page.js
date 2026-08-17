"use client";

import { useContext } from "react";
import { StudentContext } from "@/context/StudentContext";

import CourseCard from "@/components/student/CourseCard";

export default function StudentCourses() {
  const {
    enrollments,
    loading,
    error,
    refreshStudentData,
  } = useContext(StudentContext);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading your courses...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={refreshStudentData}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
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

        {/* Header */}

        <section className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Academics
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My Courses
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Courses you are currently enrolled in.
            </p>
          </div>

          <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            {enrollments.length} courses
          </span>
        </section>

        {/* Courses */}

        {enrollments.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <h2 className="font-semibold text-slate-900">
              No courses yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You are not enrolled in any courses.
            </p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrollments.map((course) => (
              <CourseCard
                key={course.course_section_id}
                course={course}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
