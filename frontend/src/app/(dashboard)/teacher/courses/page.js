"use client";

import { useState } from "react";
import { useTeacher } from "@/context/TeacherContext";
import TeacherCourseCard from "@/components/teacher/TeacherCourseCard";
import TeacherStudentList from "@/components/teacher/TeacherStudentList";

export default function TeacherCourses() {
  const {
    courseSections,
    students,
    fetchStudents,
    loading,
    error,
  } = useTeacher();

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  async function openStudents(course) {
    try {
      setSelectedCourse(course);
      setStudentsError("");
      setStudentsLoading(true);

      await fetchStudents(course.course_section_id);
    } catch (err) {
      setStudentsError(
        err.message || "Unable to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  function closeStudents() {
    setSelectedCourse(null);
    setStudentsError("");
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading courses...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
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
            My Courses
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View the course sections assigned to you
            and their enrolled students.
          </p>
        </section>

        {/* Course Sections */}
        {courseSections.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="font-semibold text-slate-900">
              No courses assigned
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You currently have no assigned course
              sections.
            </p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courseSections.map((course) => (
              <TeacherCourseCard
                key={course.course_section_id}
                course={course}
                onClick={() => openStudents(course)}
              />
            ))}
          </section>
        )}
      </div>

      {/* Students */}
      <TeacherStudentList
        course={selectedCourse}
        students={students}
        loading={studentsLoading}
        error={studentsError}
        onClose={closeStudents}
      />
    </main>
  );
}