"use client";

import { useState } from "react";
import { useTeacher } from "@/context/TeacherContext";
import AttendanceModal from "@/components/teacher/AttendanceModal";
import AttendanceRecord from "@/components/teacher/AttendanceRecord";

export default function TeacherAttendance() {
  const {
    courseSections,
    attendance,
    loading,
    error,
    fetchStudents,
    markAttendance,
    updateAttendance: updateAttendanceContext,
    refreshAttendance,
  } = useTeacher();

  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] =
    useState(false);
  const [studentsError, setStudentsError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState(null);

  async function loadStudents(course) {
    try {
      setSelectedCourse(course);
      setStudents([]);
      setStudentsError("");
      setStudentsLoading(true);

      const data = await fetchStudents(
        course.course_section_id
      );

      setStudents(data || []);
    } catch (err) {
      setStudentsError(
        err.message || "Unable to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  function openAttendance() {
    if (!selectedCourse || !students.length) {
      return;
    }

    setShowModal(true);
  }

  async function handleUpdateAttendance(
    attendanceId,
    status
  ) {
    try {
      setUpdatingId(attendanceId);

      await updateAttendanceContext(
        attendanceId,
        { status }
      );
    } catch (err) {
      alert(
        err.message ||
          "Unable to update attendance."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const selectedAttendance = selectedCourse
    ? attendance.filter(
        (record) =>
          record.course_section_id ===
          selectedCourse.course_section_id
      )
    : [];

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading attendance...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <p className="text-sm text-red-600">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Teaching
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Attendance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Mark and manage attendance for your
            course sections.
          </p>
        </section>

        {/* Course Sections */}
        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {courseSections.map((course) => {
            const selected =
              selectedCourse?.course_section_id ===
              course.course_section_id;

            return (
              <button
                key={course.course_section_id}
                type="button"
                onClick={() =>
                  loadStudents(course)
                }
                className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
                  selected
                    ? "border-indigo-500 ring-2 ring-indigo-100"
                    : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {course.subject_code}
                </p>

                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  {course.subject_name}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Section {course.section_name}
                </p>
              </button>
            );
          })}
        </section>

        {/* Selected Course */}
        {selectedCourse && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Course Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {selectedCourse.subject_code}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedCourse.subject_name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Section{" "}
                  {selectedCourse.section_name}
                </p>
              </div>

              <button
                type="button"
                onClick={openAttendance}
                disabled={
                  studentsLoading ||
                  !students.length
                }
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark Attendance
              </button>
            </div>

            {/* Existing Attendance */}
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-semibold text-slate-900">
                Existing Attendance
              </h3>
            </div>

            {/* Loading Students */}
            {studentsLoading && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-500">
                  Loading students...
                </p>
              </div>
            )}

            {/* Student Error */}
            {studentsError && (
              <div className="m-5 rounded-xl bg-red-50 p-4">
                <p className="text-sm text-red-600">
                  {studentsError}
                </p>
              </div>
            )}

            {/* No Attendance */}
            {!studentsLoading &&
              !studentsError &&
              selectedAttendance.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-slate-500">
                    No attendance records have been
                    marked for this course yet.
                  </p>
                </div>
              )}

            {/* Attendance Records */}
            {!studentsLoading &&
              !studentsError &&
              selectedAttendance.length > 0 && (
                <div>
                  {selectedAttendance.map(
                    (record) => {
                      const student =
                        students.find(
                          (item) =>
                            item.student_id ===
                            record.student_id
                        );

                      return (
                        <AttendanceRecord
                          key={record.id}
                          record={record}
                          studentName={
                            student?.name
                          }
                          updating={
                            updatingId ===
                            record.id
                          }
                          onUpdate={
                            handleUpdateAttendance
                          }
                        />
                      );
                    }
                  )}
                </div>
              )}
          </section>
        )}
      </div>

      {/* Mark Attendance Modal */}
      <AttendanceModal
        open={showModal}
        course={selectedCourse}
        students={students}
        onClose={() =>
          setShowModal(false)
        }
        onSuccess={async () => {
          setShowModal(false);
          await refreshAttendance(
            selectedCourse?.course_section_id
          );
        }}
      />
    </main>
  );
}