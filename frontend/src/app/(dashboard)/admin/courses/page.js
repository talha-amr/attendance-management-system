"use client";

import { useContext, useMemo, useState } from "react";
import { AdminContext } from "@/context/AdminContext";
import CourseModal from "@/components/admin/CourseModal";

export default function AdminCourses() {
  const {
    courseSections,
    subjects,
    teachers,
    loading,
    actionLoading,
    error,
    createCourseSection,
  } = useContext(AdminContext);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) {
      return courseSections;
    }

    const query = search.toLowerCase().trim();

    return courseSections.filter((course) => {
      return (
        course.subject_name?.toLowerCase().includes(query) ||
        course.subject_code?.toLowerCase().includes(query) ||
        course.section_name?.toLowerCase().includes(query) ||
        course.teacher_name?.toLowerCase().includes(query) ||
        String(course.semester ?? "").includes(query) ||
        String(course.academic_year ?? "").includes(query)
      );
    });
  }, [courseSections, search]);

  const handleCreateCourse = async (courseData) => {
    await createCourseSection(courseData);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Courses
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage course sections and their assigned teachers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Create Course
        </button>
      </div>

      {/* Search + Count */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by subject, teacher, section..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 sm:max-w-md"
        />

        <p className="text-sm text-gray-500">
          Total Courses:{" "}
          <span className="font-semibold text-gray-900">
            {courseSections.length}
          </span>
        </p>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Loading courses...
          </p>
        </div>
      ) : (
        /* Courses Table */
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Section
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Teacher
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Semester
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Academic Year
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Students
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr
                      key={course.course_section_id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Subject */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {course.subject_code || "—"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {course.subject_name || "—"}
                        </div>
                      </td>

                      {/* Section */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {course.section_name || "—"}
                      </td>

                      {/* Teacher */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {course.teacher_name || "—"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {course.teacher_email || ""}
                        </div>
                      </td>

                      {/* Semester */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {course.semester ?? "—"}
                      </td>

                      {/* Academic Year */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {course.academic_year ?? "—"}
                      </td>

                      {/* Students */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {course.student_count ?? 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      {search
                        ? "No courses match your search."
                        : "No courses found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCourse}
        subjects={subjects}
        teachers={teachers}
        actionLoading={actionLoading}
      />
    </div>
  );
}