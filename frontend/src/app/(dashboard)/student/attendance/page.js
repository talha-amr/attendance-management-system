"use client";

import { useState } from "react";
import { useStudent } from "@/context/StudentContext";

export default function AttendancePage() {
  const {
    enrollments,
    attendance,
    loading,
    error,
    refreshStudentData,
    refreshAttendance,
  } = useStudent();

  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const loadingData = loading;

  const selectedAttendance = selectedCourse
    ? attendance.filter(
        (record) =>
          record.course_section_id ===
          selectedCourse.course_section_id
      )
    : [];

  const presentCount = selectedAttendance.filter(
    (record) =>
      record.status?.toUpperCase() === "PRESENT"
  ).length;

  const absentCount = selectedAttendance.filter(
    (record) =>
      record.status?.toUpperCase() === "ABSENT"
  ).length;

  const totalCount = selectedAttendance.length;

  const attendancePercentage =
    totalCount > 0
      ? Math.round(
          (presentCount / totalCount) * 100
        )
      : 0;

  if (loadingData) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading attendance...
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
            onClick={async () => {
              await Promise.all([
                refreshStudentData(),
                refreshAttendance(),
              ]);
            }}
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
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Student Attendance
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Attendance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your attendance records for each enrolled course.
          </p>
        </section>

        {/* Course List */}

        {!selectedCourse ? (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                My Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a course to view its attendance.
              </p>
            </div>

            {enrollments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  You are not enrolled in any courses.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((course) => {
                  const courseAttendance =
                    attendance.filter(
                      (record) =>
                        record.course_section_id ===
                        course.course_section_id
                    );

                  const present = courseAttendance.filter(
                    (record) =>
                      record.status?.toUpperCase() ===
                      "PRESENT"
                  ).length;

                  const total =
                    courseAttendance.length;

                  const percentage =
                    total > 0
                      ? Math.round(
                          (present / total) * 100
                        )
                      : 0;

                  return (
                    <button
                      key={course.course_section_id}
                      onClick={() =>
                        setSelectedCourse(course)
                      }
                      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                          {course.subject_code?.slice(
                            0,
                            2
                          ) || "CO"}
                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                          Section {course.section_name}
                        </span>
                      </div>

                      <h3 className="mt-5 line-clamp-2 text-sm font-bold text-slate-900">
                        {course.subject_name}
                      </h3>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {course.subject_code}
                      </p>

                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-slate-400">
                              Attendance
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-800">
                              {percentage}%
                            </p>
                          </div>

                          <p className="text-xs text-slate-400">
                            {present}/{total} present
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Back */}

            <button
              onClick={() =>
                setSelectedCourse(null)
              }
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              ← Back to courses
            </button>

            {/* Course Header */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {selectedCourse.subject_code}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedCourse.subject_name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Section {selectedCourse.section_name}
                    {" · "}
                    {selectedCourse.teacher_name}
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50 px-5 py-4 text-center">
                  <p className="text-xs font-medium text-indigo-500">
                    Attendance
                  </p>

                  <p className="mt-1 text-2xl font-bold text-indigo-600">
                    {attendancePercentage}%
                  </p>
                </div>
              </div>
            </section>

            {/* Stats */}

            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">
                  Total Classes
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">
                  Present
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {presentCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">
                  Absent
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {absentCount}
                </p>
              </div>
            </section>

            {/* Attendance Records */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Attendance History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Attendance records for this course.
                </p>
              </div>

              {selectedAttendance.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-500">
                    No attendance records available for this course.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="hidden grid-cols-[1fr_160px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-400 sm:grid">
                    <span>Date</span>
                    <span>Teacher</span>
                    <span>Status</span>
                  </div>

                  {[...selectedAttendance]
                    .sort(
                      (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                    )
                    .map((record) => {
                      const isPresent =
                        record.status?.toUpperCase() ===
                        "PRESENT";

                      return (
                        <div
                          key={record.id}
                          className="grid gap-2 border-b border-slate-100 px-6 py-4 last:border-b-0 sm:grid-cols-[1fr_160px_120px] sm:items-center sm:gap-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {new Date(
                                record.date
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {record.subject_code}
                            </p>
                          </div>

                          <p className="text-xs font-medium text-slate-500">
                            {record.teacher_name ||
                              "—"}
                          </p>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold ${
                              isPresent
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {record.status}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
