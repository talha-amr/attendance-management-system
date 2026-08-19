"use client";

import { useEffect, useState } from "react";

export default function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  subjects,
  teachers,
  actionLoading,
}) {
  const [formData, setFormData] = useState({
    subject_id: "",
    teacher_id: "",
    section_name: "",
    semester: "",
    academic_year: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject_id: "",
        teacher_id: "",
        section_name: "",
        semester: "",
        academic_year: "",
      });

      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const approvedTeachers = teachers.filter(
    (teacher) =>
      teacher.approval_status?.toLowerCase() === "approved"
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove the current error when the user starts correcting it.
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // ==========================================
    // SUBJECT VALIDATION
    // ==========================================

    if (!formData.subject_id) {
      setError("Please select a subject.");
      return;
    }

    const subjectId = Number(formData.subject_id);

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      setError("Please select a valid subject.");
      return;
    }

    // ==========================================
    // TEACHER VALIDATION
    // ==========================================

    if (!formData.teacher_id) {
      setError("Please select a teacher.");
      return;
    }

    const teacherId = Number(formData.teacher_id);

    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      setError("Please select a valid teacher.");
      return;
    }

    // ==========================================
    // SECTION NAME VALIDATION
    // Backend:
    // min_length=1, max_length=20
    // ==========================================

    const sectionName = formData.section_name.trim();

    if (!sectionName) {
      setError("Section name is required.");
      return;
    }

    if (sectionName.length > 20) {
      setError("Section name cannot exceed 20 characters.");
      return;
    }

    // ==========================================
    // SEMESTER VALIDATION
    // Backend:
    // ge=1, le=8
    // ==========================================

    if (!formData.semester) {
      setError("Please enter the semester.");
      return;
    }

    const semester = Number(formData.semester);

    if (!Number.isInteger(semester)) {
      setError("Semester must be a whole number.");
      return;
    }

    if (semester < 1 || semester > 8) {
      setError("Semester must be between 1 and 8.");
      return;
    }

    // ==========================================
    // ACADEMIC YEAR VALIDATION
    // Backend:
    // ge=2000, le=2100
    // ==========================================

    if (!formData.academic_year) {
      setError("Please enter the academic year.");
      return;
    }

    const academicYear = Number(formData.academic_year);

    if (!Number.isInteger(academicYear)) {
      setError("Academic year must be a whole number.");
      return;
    }

    if (academicYear < 2000 || academicYear > 2100) {
      setError(
        "Academic year must be between 2000 and 2100."
      );
      return;
    }

    // ==========================================
    // SUBMIT
    // ==========================================

    setError("");

    try {
      await onSubmit({
        subject_id: subjectId,
        teacher_id: teacherId,
        section_name: sectionName,
        semester,
        academic_year: academicYear,
      });

      onClose();
    } catch (err) {
      setError(
        err.message || "Failed to create course section."
      );
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
              Create Course
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a new course section.
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

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          {/* Subject */}

          <div>
            <label
              htmlFor="subject_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Subject
            </label>

            <select
              id="subject_id"
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:bg-gray-100"
            >
              <option value="">
                Select a subject
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher */}

          <div>
            <label
              htmlFor="teacher_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Teacher
            </label>

            <select
              id="teacher_id"
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:bg-gray-100"
            >
              <option value="">
                Select a teacher
              </option>

              {approvedTeachers.map((teacher) => (
                <option
                  key={teacher.teacher_id}
                  value={teacher.teacher_id}
                >
                  {teacher.name} - {teacher.email}
                </option>
              ))}
            </select>

            {approvedTeachers.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                No approved teachers are available.
              </p>
            )}
          </div>

          {/* Section */}

          <div>
            <label
              htmlFor="section_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Section Name
            </label>

            <input
              id="section_name"
              name="section_name"
              type="text"
              maxLength={20}
              value={formData.section_name}
              onChange={handleChange}
              placeholder="e.g. A"
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Maximum 20 characters.
            </p>
          </div>

          {/* Semester */}

          <div>
            <label
              htmlFor="semester"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Semester
            </label>

            <input
              id="semester"
              name="semester"
              type="number"
              min="1"
              max="8"
              step="1"
              value={formData.semester}
              onChange={handleChange}
              placeholder="e.g. 5"
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Semester must be between 1 and 8.
            </p>
          </div>

          {/* Academic Year */}

          <div>
            <label
              htmlFor="academic_year"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Academic Year
            </label>

            <input
              id="academic_year"
              name="academic_year"
              type="number"
              min="2000"
              max="2100"
              step="1"
              value={formData.academic_year}
              onChange={handleChange}
              placeholder="e.g. 2026"
              disabled={actionLoading}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Academic year must be between 2000 and 2100.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
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
                approvedTeachers.length === 0
              }
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading
                ? "Creating..."
                : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}