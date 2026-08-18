"use client";

import { useContext, useState,useEffect } from "react";
import { AdminContext } from "@/context/AdminContext";
import EnrollmentModal from "@/components/admin/EnrollmentModal";
import SectionStudentsModal from "@/components/admin/SectionStudentsModal";

export default function AdminEnrollments() {
  const {
    students,
    courseSections,
    sectionStudents,
    selectedSection,
    loading,
    actionLoading,
    error,
    enrollStudent,
    fetchSectionStudents,
    deleteEnrollment,
    setError
  } = useContext(AdminContext);
useEffect(() => {

    return () => {

        setError(null);

    };

}, []); 
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleViewStudents = async (course) => {
    try {
      setSelectedCourse(course);

      await fetchSectionStudents(course.course_section_id);

      setIsStudentsModalOpen(true);
    } catch (err) {
      // Error is already handled by AdminContext.
    }
  };

  const handleDeleteEnrollment = async (
    studentId,
    courseSectionId
  ) => {
    await deleteEnrollment(studentId, courseSectionId);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Enrollments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enroll students into course sections and manage their
            enrollments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEnrollmentModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Enroll Student
        </button>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Course Sections */}
      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Course Sections
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and manage students enrolled in each course section.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              Loading course sections...
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
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
                      Students
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {courseSections.length > 0 ? (
                    courseSections.map((course) => (
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

                        {/* Student Count */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {course.student_count ?? 0}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewStudents(course)}
                            disabled={actionLoading}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            View Students
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        No course sections found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        students={students}
        courseSections={courseSections}
        onSubmit={enrollStudent}
        actionLoading={actionLoading}
      />

      {/* Section Students Modal */}
      <SectionStudentsModal
        isOpen={isStudentsModalOpen}
        onClose={() => {
          setIsStudentsModalOpen(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        students={sectionStudents}
        selectedSection={selectedSection}
        onDelete={handleDeleteEnrollment}
        actionLoading={actionLoading}
      />
    </div>
  );
}