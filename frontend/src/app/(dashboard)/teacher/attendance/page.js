"use client";

import { useState } from "react";
import { useTeacher } from "@/context/TeacherContext";
import AttendanceModal from "@/components/teacher/AttendanceModal";
import AttendanceRecord from "@/components/teacher/AttendanceRecord";

export default function TeacherAttendance() {
  const {
    courseSections,
    timetable,
    attendance,
    loading,
    error,
    fetchStudents,
    refreshAttendance,
    updateAttendance: updateAttendanceContext,
  } = useTeacher();

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadStudents(course) {
    try {
      setSelectedCourse(course);
      setStudents([]);
      setStudentsError("");
      setStudentsLoading(true);

      const [studentsData] = await Promise.all([
        fetchStudents(course.course_section_id),
        refreshAttendance(course.course_section_id),
      ]);

      setStudents(studentsData || []);
    } catch (err) {
      setStudentsError(
        err.message || "Unable to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  /*
   * ==========================================
   * TODAY
   * ==========================================
   */

  const today = new Date();

  const todayDay = today
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toLowerCase();

  const formattedToday = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /*
   * ==========================================
   * SELECTED COURSE'S TODAY'S TIMETABLE
   * ==========================================
   */

  const todayTimetable = selectedCourse
    ? timetable.filter(
        (item) =>
          item.course_section_id ===
            selectedCourse.course_section_id &&
          item.day_of_week?.toLowerCase() === todayDay
      )
    : [];

  const hasTodayClass = todayTimetable.length > 0;

  function openAttendance() {
    if (
      !selectedCourse ||
      !students.length ||
      !hasTodayClass
    ) {
      return;
    }

    setShowModal(true);
  }

  /*
   * ==========================================
   * UPDATE ATTENDANCE
   * ==========================================
   */

  async function handleUpdateAttendance(attendanceId, status) {
    try {
      setUpdatingId(attendanceId);

      await updateAttendanceContext(
        attendanceId,
        { status }
      );
    } catch (err) {
      alert(
        err.message || "Unable to update attendance."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * ==========================================
   * DATE HELPERS
   * ==========================================
   */

  function getDateKey(dateString) {
    return dateString;
  }

  function getLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getDateLabel(dateString) {
    const recordDate = new Date(
      `${dateString}T00:00:00`
    );

    const todayDate = new Date();
    const yesterdayDate = new Date();

    yesterdayDate.setDate(
      yesterdayDate.getDate() - 1
    );

    const recordKey = getLocalDateKey(recordDate);
    const todayKey = getLocalDateKey(todayDate);
    const yesterdayKey =
      getLocalDateKey(yesterdayDate);

    if (recordKey === todayKey) {
      return "Today";
    }

    if (recordKey === yesterdayKey) {
      return "Yesterday";
    }

    return recordDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  /*
   * ==========================================
   * LAST 7 DAYS ATTENDANCE
   *
   * Important:
   * We are NOT assuming there was a lecture
   * every day.
   *
   * We simply show attendance records that
   * actually exist within the last 7 days.
   * ==========================================
   */

  const sevenDaysAgo = new Date();

  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 6
  );

  const recentAttendance = attendance.filter(
    (record) => {
      const recordDate = new Date(
        `${record.date}T00:00:00`
      );

      recordDate.setHours(0, 0, 0, 0);

      return recordDate >= sevenDaysAgo;
    }
  );

  /*
   * ==========================================
   * GROUP ATTENDANCE BY DATE
   * ==========================================
   */

  const attendanceByDate =
    recentAttendance.reduce(
      (groups, record) => {
        const key = getDateKey(record.date);

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(record);

        return groups;
      },
      {}
    );

  /*
   * Sort newest date first.
   */

  const attendanceDates = Object.keys(
    attendanceByDate
  ).sort((a, b) => b.localeCompare(a));

  /*
   * ==========================================
   * LOADING / ERROR
   * ==========================================
   */

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
            Mark and manage attendance for your course
            sections.
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

                <p className="mt-3 text-xs font-medium text-slate-400">
                  {course.student_count} students
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
                  Section {selectedCourse.section_name}
                </p>
              </div>

              <button
                type="button"
                onClick={openAttendance}
                disabled={
                  studentsLoading ||
                  !students.length ||
                  !hasTodayClass
                }
                className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark Attendance
              </button>
            </div>

            {/* Today's Class */}

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Today&apos;s Class
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formattedToday}
                  </p>
                </div>

                {hasTodayClass ? (
                  <div className="flex flex-wrap gap-3">
                    {todayTimetable.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-indigo-100 bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />

                          <p className="text-sm font-semibold text-slate-900">
                            {item.day_of_week
                              ?.charAt(0)
                              .toUpperCase() +
                              item.day_of_week?.slice(1)}
                          </p>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.start_time?.slice(0, 5)} -{" "}
                          {item.end_time?.slice(0, 5)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-800">
                      No class scheduled today
                    </p>

                    <p className="mt-1 text-xs text-amber-700">
                      Attendance cannot be marked for this
                      course today.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Attendance */}

            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Recent Attendance
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Attendance records from the last 7 days.
                  </p>
                </div>

                {recentAttendance.length > 0 && (
                  <p className="text-xs font-medium text-slate-400">
                    {recentAttendance.length} records
                  </p>
                )}
              </div>
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

            {/* No Recent Attendance */}

            {!studentsLoading &&
              !studentsError &&
              recentAttendance.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No attendance records in the last 7 days.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Attendance will appear here after it is
                    marked.
                  </p>
                </div>
              )}

            {/* Attendance By Date */}

            {!studentsLoading &&
              !studentsError &&
              attendanceDates.length > 0 && (
                <div>
                  {attendanceDates.map((date) => (
                    <section
                      key={date}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      {/* Date Header */}

                      <div className="flex items-center justify-between bg-slate-50 px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {getDateLabel(date)}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {date}
                          </p>
                        </div>

                        <p className="text-xs font-medium text-slate-400">
                          {attendanceByDate[date].length}{" "}
                          records
                        </p>
                      </div>

                      {/* Records */}

                      <div>
                        {attendanceByDate[date].map(
                          (record) => (
                            <AttendanceRecord
                              key={record.id}
                              record={record}
                              updating={
                                updatingId === record.id
                              }
                              onUpdate={
                                handleUpdateAttendance
                              }
                            />
                          )
                        )}
                      </div>
                    </section>
                  ))}
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
        onClose={() => setShowModal(false)}
        onSuccess={async () => {
          await refreshAttendance(
            selectedCourse?.course_section_id
          );
        }}
      />
    </main>
  );
}