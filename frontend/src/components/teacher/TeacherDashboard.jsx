"use client";

import { useTeacher } from "@/context/TeacherContext";

export default function TeacherDashboard() {
  const {
    teacher,
    courseSections,
    timetable,
    attendance,
    loading,
    error,
    fetchTeacherData,
  } = useTeacher();

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading teacher dashboard...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-bold text-red-800">
            Could not load dashboard
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchTeacherData}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!teacher) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Teacher information is not available.
        </p>
      </main>
    );
  }

  const status = teacher.approval_status?.toUpperCase();

  if (status === "PENDING") {
    return (
      <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
            ⏳
          </div>

          <p className="mt-5 text-sm font-semibold text-amber-700">
            APPROVAL PENDING
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {teacher.user?.name}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Your teacher registration has been submitted and is
            waiting for approval from an administrator.
          </p>

          <div className="mt-6 rounded-xl bg-white px-4 py-3">
            <p className="text-sm text-slate-500">
              Registered email
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {teacher.user?.email}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "REJECTED") {
    return (
      <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            ✕
          </div>

          <p className="mt-5 text-sm font-semibold text-red-700">
            REGISTRATION REJECTED
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Teacher access unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Your teacher registration was not approved. Please
            contact the school administrator for more
            information.
          </p>

          <div className="mt-6 rounded-xl bg-white px-4 py-3">
            <p className="text-sm text-slate-500">
              Registered email
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {teacher.user?.email}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "APPROVED") {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Teacher Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome, {teacher.user?.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your classes, lectures and attendance activity.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Assigned Classes"
              value={courseSections.length}
            />

            <Stat
              label="Total Students"
              value={getTotalStudents(courseSections)}
            />

            <Stat
              label="Today's Lectures"
              value={getTodayLectures(timetable)}
            />

            <Stat
              label="Attendance Records"
              value={attendance.length}
            />
          </section>

          <section>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Academics
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Your Classes
              </h2>
            </div>

            {courseSections.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-sm text-slate-500">
                  No course sections assigned to you.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courseSections.map((course) => (
                  <div
                    key={course.course_section_id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          {course.subject_code}
                        </p>

                        <h3 className="mt-2 text-lg font-bold text-slate-900">
                          {course.subject_name}
                        </h3>
                      </div>

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        Section {course.section_name}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                      <DashboardDetail
                        label="Students"
                        value={course.student_count}
                      />

                      <DashboardDetail
                        label="Semester"
                        value={course.semester}
                      />

                      <DashboardDetail
                        label="Academic Year"
                        value={course.academic_year}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <p className="text-sm text-red-600">
        Unknown teacher approval status.
      </p>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DashboardDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function getTodayLectures(timetable) {
  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();

  return timetable.filter(
    (item) => item.day_of_week === today
  ).length;
}

function getTotalStudents(courseSections) {
  return courseSections.reduce(
    (total, course) => total + (course.student_count || 0),
    0
  );
}