"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

import DashboardStat from "@/components/student/DashboardStat";
import TodaySchedule from "@/components/student/TodaySchedule";
import CourseCard from "@/components/student/CourseCard";
import CourseModal from "@/components/student/CourseModal";
import RecentAttendance from "@/components/student/RecentAttendance";
import AttendanceModal from "@/components/student/AttendanceModal";

export default function StudentDashboard() {
  const { user, loading: authLoading, error: authError } =
    useContext(AuthContext);

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCourses, setShowCourses] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    loadStudentDashboard();
  }, [authLoading, authError]);

  async function loadStudentDashboard() {
    try {
      setLoading(true);
      setError("");

      /*
       * ==========================================
       * API INTEGRATION PLACEHOLDER
       * ==========================================
       *
       * Replace these with your actual API calls:
       *
       * GET /students/me
       * GET /students/me/enrollments
       * GET /students/timetables
       * GET /students/attendance
       *
       * Example:
       *
       * const studentResponse = await fetch(...);
       * const enrollmentResponse = await fetch(...);
       * ...
       *
       * For now, placeholder data is being used.
       */

      const studentData = {
        id: user?.id,
        name: user?.name,
      };

      const enrollmentData = [
        {
          course_section_id: 1,
          subject_id: 101,
          subject_name: "Software Engineering",
          subject_code: "SE-301",
          teacher_id: 10,
          teacher_name: "Muhammad Ahmed",
          section_name: "A",
          semester: "6th",
          academic_year: "2026",
        },
        {
          course_section_id: 2,
          subject_id: 102,
          subject_name: "Database Systems",
          subject_code: "DB-301",
          teacher_id: 11,
          teacher_name: "Sarah Khan",
          section_name: "A",
          semester: "6th",
          academic_year: "2026",
        },
        {
          course_section_id: 3,
          subject_id: 103,
          subject_name: "Web Engineering",
          subject_code: "WE-301",
          teacher_id: 12,
          teacher_name: "Ali Raza",
          section_name: "A",
          semester: "6th",
          academic_year: "2026",
        },
        {
          course_section_id: 4,
          subject_id: 104,
          subject_name: "Computer Networks",
          subject_code: "CN-301",
          teacher_id: 13,
          teacher_name: "Usman Malik",
          section_name: "A",
          semester: "6th",
          academic_year: "2026",
        },
      ];

      const timetableData = [
        {
          id: 1,
          course_section_id: 1,
          day_of_week: "MONDAY",
          start_time: "09:00",
          end_time: "10:00",
        },
        {
          id: 2,
          course_section_id: 2,
          day_of_week: "MONDAY",
          start_time: "11:00",
          end_time: "12:00",
        },
        {
          id: 3,
          course_section_id: 3,
          day_of_week: "MONDAY",
          start_time: "14:00",
          end_time: "15:00",
        },
        {
          id: 4,
          course_section_id: 4,
          day_of_week: "TUESDAY",
          start_time: "10:00",
          end_time: "11:00",
        },
      ];

      const attendanceData = [
        {
          id: 1,
          course_section_id: 1,
          date: "2026-08-12",
          status: "PRESENT",
          marked_at: "2026-08-12T09:05:00",
        },
        {
          id: 2,
          course_section_id: 2,
          date: "2026-08-12",
          status: "ABSENT",
          marked_at: "2026-08-12T11:05:00",
        },
        {
          id: 3,
          course_section_id: 3,
          date: "2026-08-11",
          status: "PRESENT",
          marked_at: "2026-08-11T14:04:00",
        },
        {
          id: 4,
          course_section_id: 1,
          date: "2026-08-11",
          status: "PRESENT",
          marked_at: "2026-08-11T09:04:00",
        },
        {
          id: 5,
          course_section_id: 2,
          date: "2026-08-11",
          status: "PRESENT",
          marked_at: "2026-08-11T11:03:00",
        },
      ];

      setStudent(studentData);
      setEnrollments(enrollmentData);
      setTimetable(timetableData);
      setAttendance(attendanceData);
    } catch (err) {
      setError("Unable to load student dashboard.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            onClick={loadStudentDashboard}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const sectionMap = Object.fromEntries(
    enrollments.map((enrollment) => [
      enrollment.course_section_id,
      enrollment,
    ])
  );

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  const todaySchedule = timetable
    .filter((item) => item.day_of_week === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const totalAttendance = attendance.length;

  const presentAttendance = attendance.filter(
    (item) => item.status === "PRESENT"
  ).length;

  const absentAttendance = attendance.filter(
    (item) => item.status === "ABSENT"
  ).length;

  const attendancePercentage =
    totalAttendance > 0
      ? Math.round((presentAttendance / totalAttendance) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Student Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome, {student?.name || user?.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Here&apos;s an overview of your academic activity.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-400">
              Academic Year
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              2026
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat
            label="Enrolled Courses"
            value={enrollments.length}
            description="Currently enrolled"
          />

          <DashboardStat
            label="Today's Lectures"
            value={todaySchedule.length}
            description="Scheduled for today"
          />

          <DashboardStat
            label="Present"
            value={presentAttendance}
            description="Attendance records"
          />

          <DashboardStat
            label="Overall Attendance"
            value={`${attendancePercentage}%`}
            description={`${absentAttendance} absent`}
            highlight
          />
        </section>

        {/* Schedule + Attendance */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <TodaySchedule
            schedule={todaySchedule}
            sectionMap={sectionMap}
          />

          <RecentAttendance
            attendance={attendance}
            sectionMap={sectionMap}
            onViewAll={() => setShowAttendance(true)}
          />
        </section>

        {/* Courses */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Academics
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                My Courses
              </h2>
            </div>

            {enrollments.length > 4 && (
              <button
                onClick={() => setShowCourses(true)}
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                View all
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {enrollments.slice(0, 4).map((course) => (
              <CourseCard
                key={course.course_section_id}
                course={course}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Courses Modal */}
      <CourseModal
        open={showCourses}
        courses={enrollments}
        onClose={() => setShowCourses(false)}
      />

      {/* Attendance Modal */}
      <AttendanceModal
        open={showAttendance}
        attendance={attendance}
        sectionMap={sectionMap}
        onClose={() => setShowAttendance(false)}
      />
    </main>
  );
}