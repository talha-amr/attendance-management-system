"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { user, loading, error } = useContext(AuthContext);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading student dashboard...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            STUDENT DASHBOARD
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your classes, lectures and attendance information.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Assigned Class
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              Not assigned
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Your class information will appear here.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Today&apos;s Lectures
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              —
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Today&apos;s lecture schedule will appear here.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Overall Attendance
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              —%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Your attendance percentage will appear here.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your recent lecture attendance records.
            </p>
          </div>

          <div className="px-5 py-12 text-center">
            <p className="text-sm text-slate-500">
              No attendance records are available yet.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}