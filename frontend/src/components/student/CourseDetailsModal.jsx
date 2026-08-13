"use client";

import { useEffect } from "react";

export default function CourseDetailsModal({
  course,
  open,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !course) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {course.subject_code}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {course.subject_name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-6">
          <DetailRow
            label="Teacher"
            value={course.teacher_name}
          />

          <DetailRow
            label="Section"
            value={course.section_name}
          />

          <DetailRow
            label="Semester"
            value={course.semester}
          />

          <DetailRow
            label="Academic Year"
            value={course.academic_year}
          />

          <DetailRow
            label="Course Section ID"
            value={course.course_section_id}
          />

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enrollment Status
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${
                course.is_enrolled
                  ? "text-emerald-600"
                  : "text-slate-700"
              }`}
            >
              {course.is_enrolled
                ? "You are already enrolled in this course."
                : "You are not enrolled in this course."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-slate-100 pb-3">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}