"use client";

import { useEffect, useState } from "react";

export default function EnrollmentModal({
  isOpen,
  onClose,
  students,
  courseSections,
  onSubmit,
  actionLoading,
}) {
  const [formData, setFormData] = useState({
    student_id: "",
    course_section_id: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        student_id: "",
        course_section_id: "",
      });

      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.student_id) {
      setError("Please select a student.");
      return;
    }

    if (!formData.course_section_id) {
      setError("Please select a course section.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        student_id: Number(formData.student_id),
        course_section_id: Number(formData.course_section_id),
      });

      onClose();
    } catch (err) {
      setError(err.message || "Failed to enroll student.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Enroll Student
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enroll a student into a course section.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="text-xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Student */}
          <div>
            <label
              htmlFor="student_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Student
            </label>

            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:bg-gray-100"
            >
              <option value="">Select a student</option>

              {students.map((student) => (
                <option
                  key={student.student_id}
                  value={student.student_id}
                >
                  {student.name} - {student.email}
                </option>
              ))}
            </select>

            {students.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                No students are available.
              </p>
            )}
          </div>

          {/* Course Section */}
          <div>
            <label
              htmlFor="course_section_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Course Section
            </label>

            <select
              id="course_section_id"
              name="course_section_id"
              value={formData.course_section_id}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:bg-gray-100"
            >
              <option value="">Select a course section</option>

              {courseSections.map((course) => (
                <option
                  key={course.course_section_id}
                  value={course.course_section_id}
                >
                  {course.subject_code} - Section {course.section_name}
                  {" | "}
                  {course.teacher_name}
                </option>
              ))}
            </select>

            {courseSections.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                No course sections are available.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                actionLoading ||
                students.length === 0 ||
                courseSections.length === 0
              }
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? "Enrolling..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}