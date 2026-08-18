"use client";

import { useContext,useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { AdminContext } from "@/context/AdminContext";

import DashboardStat from "@/components/admin/DashboardStat";
import PendingTeachers from "@/components/admin/PendingTeachers";

export default function AdminDashboard() {
  const {
    user,
    loading: authLoading,
    error: authError,
  } = useContext(AuthContext);

  const {
    students,
    teachers,
    pendingTeachers,
    subjects,
    courseSections,
    loading: adminLoading,
    error: adminError,
    refreshAdminData,
    approveTeacher,
    rejectTeacher,
    setError
  } = useContext(AdminContext);

  useEffect(() => {

    return () => {

        setError(null);

    };

}, []); 

  const loading = authLoading || adminLoading;
  const error = authError || adminError;

  if (loading) {
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

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={refreshAdminData}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}

        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Admin Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome, {user?.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Here&apos;s an overview of the academic system.
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

        {/* Statistics */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat
            label="Students"
            value={students.length}
            description="Registered students"
          />

          <DashboardStat
            label="Teachers"
            value={teachers.length}
            description="Registered teachers"
          />

          <DashboardStat
            label="Course Sections"
            value={courseSections.length}
            description="Active course sections"
          />

          <DashboardStat
            label="Subjects"
            value={subjects.length}
            description="Available subjects"
            highlight
          />
        </section>

        {/* Teacher Approvals */}

        <PendingTeachers
          teachers={pendingTeachers}
          onApprove={approveTeacher}
          onReject={rejectTeacher}
          actionLoading={adminLoading}
        />

        {/* System Overview */}

        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              System Overview
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Academic Activity
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-400">
                Pending Teacher Approvals
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {pendingTeachers.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Teachers awaiting review
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-400">
                Enrolled Course Sections
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {courseSections.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Sections currently available
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-400">
                Average Students / Section
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {courseSections.length > 0
                  ? Math.round(
                      courseSections.reduce(
                        (total, section) =>
                          total + section.student_count,
                        0
                      ) / courseSections.length
                    )
                  : 0}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Based on current enrollments
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}