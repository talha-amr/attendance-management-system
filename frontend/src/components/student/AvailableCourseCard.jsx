"use client";

import { useState } from "react";

export default function AvailableCourseCard({
  course,
  onEnrollmentSuccess,
  onOpenDetails,
}) {
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  async function handleEnroll(event) {
    event.stopPropagation();

    try {
      setEnrolling(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not authenticated.");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/students/me/enrollments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_section_id: course.course_section_id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to enroll in this course."
        );
      }

      onEnrollmentSuccess(course.course_section_id);
    } catch (err) {
      setError(
        err.message || "Unable to enroll in this course."
      );
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <article
      onClick={onOpenDetails}
      className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {course.subject_code}
          </p>

          <h2 className="mt-2 text-lg font-bold text-slate-900">
            {course.subject_name}
          </h2>
        </div>

        {course.is_enrolled && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Enrolled
          </span>
        )}
      </div>

      {/* Details */}
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <CourseDetail
          label="Teacher"
          value={course.teacher_name}
        />

        <CourseDetail
          label="Section"
          value={course.section_name}
        />

        <CourseDetail
          label="Semester"
          value={course.semester}
        />

        <CourseDetail
          label="Academic Year"
          value={course.academic_year}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2">
          <p className="text-xs font-medium leading-relaxed text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetails();
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View Details
        </button>

        {course.is_enrolled ? (
          <button
            type="button"
            disabled
            onClick={(event) => event.stopPropagation()}
            className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
          >
            Already Enrolled
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enrolling ? "Enrolling..." : "Enroll"}
          </button>
        )}
      </div>
    </article>
  );
}

function CourseDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}