"use client";

import { useState } from "react";
import { useStudent } from "@/context/StudentContext";

export default function StudentAttendance() {
  const {
    attendance,
    enrollments,
    loading,
    error,
    refreshAttendance,
    getAttendanceBySection,
  } = useStudent();

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAttendance, setCourseAttendance] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // ==========================================
  // OVERALL ATTENDANCE
  // ==========================================

  const present = attendance.filter(
    (item) => item.status === "present"
  ).length;

  const absent = attendance.filter(
    (item) => item.status === "absent"
  ).length;

  const percentage =
    attendance.length > 0
      ? Math.round((present / attendance.length) * 100)
      : 0;

  // ==========================================
  // GET ATTENDANCE FOR A COURSE FROM
  // CURRENT OVERALL ATTENDANCE
  // ==========================================

  function getCourseStats(sectionId) {
    const records = attendance.filter(
      (item) => item.course_section_id === sectionId
    );

    const coursePresent = records.filter(
      (item) => item.status === "present"
    ).length;

    const courseAbsent = records.filter(
      (item) => item.status === "absent"
    ).length;

    const coursePercentage =
      records.length > 0
        ? Math.round(
            (coursePresent / records.length) * 100
          )
        : 0;

    return {
      present: coursePresent,
      absent: courseAbsent,
      percentage: coursePercentage,
    };
  }

  // ==========================================
  // OPEN COURSE DETAILS
  // ==========================================

  async function handleViewDetails(course) {
    setSelectedCourse(course);
    setCourseAttendance([]);
    setModalError("");
    setModalLoading(true);

    try {
      const data = await getAttendanceBySection(
        course.course_section_id
      );

      setCourseAttendance(data);
    } catch (err) {
      setModalError(
        err.message || "Failed to load course attendance."
      );
    } finally {
      setModalLoading(false);
    }
  }

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  function closeModal() {
    setSelectedCourse(null);
    setCourseAttendance([]);
    setModalError("");
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading attendance...
        </p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={refreshAttendance}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}

          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Academics
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Attendance
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your complete attendance record.
            </p>
          </section>

          {/* Overall Stats */}

          <section className="mt-8 grid gap-4 sm:grid-cols-3">

            <Stat
              label="Total Records"
              value={attendance.length}
            />

            <Stat
              label="Present"
              value={present}
              valueClass="text-emerald-600"
            />

            <Stat
              label="Attendance"
              value={`${percentage}%`}
            />

          </section>

          {/* Course Attendance */}

          <section className="mt-8">

            <div className="mb-4">
              <h2 className="font-semibold text-slate-900">
                Course Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View attendance for each enrolled course.
              </p>
            </div>

            {enrollments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  You are not enrolled in any courses.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">

                {enrollments.map((course) => {
                  const stats = getCourseStats(
                    course.course_section_id
                  );

                  return (
                    <CourseCard
                      key={course.course_section_id}
                      course={course}
                      stats={stats}
                      onViewDetails={() =>
                        handleViewDetails(course)
                      }
                    />
                  );
                })}

              </div>
            )}

          </section>
        </div>
      </main>

      {/* Attendance Modal */}

      {selectedCourse && (
        <AttendanceModal
          course={selectedCourse}
          attendance={courseAttendance}
          loading={modalLoading}
          error={modalError}
          onClose={closeModal}
        />
      )}
    </>
  );
}

// ==========================================
// STAT
// ==========================================

function Stat({
  label,
  value,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}

// ==========================================
// COURSE CARD
// ==========================================

function CourseCard({
  course,
  stats,
  onViewDetails,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h3 className="font-semibold text-slate-900">
            {course.subject_name}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {course.subject_code} · Section{" "}
            {course.section_name}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {course.teacher_name}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">
            {stats.percentage}%
          </p>

          <p className="text-xs text-slate-500">
            Attendance
          </p>
        </div>

      </div>

      {/* Present / Absent */}

      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600">
            Present
          </p>

          <p className="mt-1 text-lg font-bold text-emerald-700">
            {stats.present}
          </p>
        </div>

        <div className="rounded-xl bg-red-50 p-3">
          <p className="text-xs text-red-600">
            Absent
          </p>

          <p className="mt-1 text-lg font-bold text-red-700">
            {stats.absent}
          </p>
        </div>

      </div>

      <button
        onClick={onViewDetails}
        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        View Attendance
      </button>

    </div>
  );
}

// ==========================================
// ATTENDANCE MODAL
// ==========================================

function AttendanceModal({
  course,
  attendance,
  loading,
  error,
  onClose,
}) {
  const present = attendance.filter(
    (item) => item.status === "present"
  ).length;

  const absent = attendance.filter(
    (item) => item.status === "absent"
  ).length;

  const percentage =
    attendance.length > 0
      ? Math.round((present / attendance.length) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="font-semibold text-slate-900">
              {course.subject_name}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {course.subject_code} · Section{" "}
              {course.section_name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-2 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* Content */}

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                Loading attendance...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}

              <div className="grid grid-cols-3 gap-3">

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">
                    Attendance
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {percentage}%
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-xs text-emerald-600">
                    Present
                  </p>

                  <p className="mt-1 text-lg font-bold text-emerald-700">
                    {present}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-3 text-center">
                  <p className="text-xs text-red-600">
                    Absent
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-700">
                    {absent}
                  </p>
                </div>

              </div>

              {/* History */}

              <div className="mt-6">

                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Attendance History
                </h3>

                {attendance.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">
                      No attendance records available.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">

                    {attendance.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between px-4 py-3"
                      >

                        <p className="text-sm font-medium text-slate-800">
                          {record.date}
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            record.status === "present"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {record.status}
                        </span>

                      </div>
                    ))}

                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}