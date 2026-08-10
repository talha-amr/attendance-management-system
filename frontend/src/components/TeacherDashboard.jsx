"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        setError("");

       const token= localStorage.getItem("access_token")

        if (!token) {
        router.replace("/auth");
        return;
      }
       const response= await fetch("http://127.0.0.1:8000/teachers/me",{
          method: "GET",
          headers: {
            Authorization : `Bearer ${token}`,
          },
        }
       )
       const data = await response.json()
       if (response.status==401){
        localStorage.removeItem("access_token")
        router.replace('/auth')
       }
       else if (response.status==403)
          setError("cant retrieve data")
       else if(response.ok)
          setTeacher(data)
      } catch {
        setError("Could not load teacher information.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [router]);

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

          <p className="mt-2 text-sm text-red-700">{error}</p>
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
            Your teacher registration has been submitted and is waiting for
            approval from an administrator.
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
            Your teacher registration was not approved. Please contact the
            school administrator for more information.
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
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              TEACHER DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome, {teacher.user?.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your classes, lectures and attendance activity.
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-700">
              Account approved
            </p>

            <p className="mt-1 text-sm text-green-800">
              You have access to teacher features.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Assigned Classes
              </p>

              <p className="mt-3 text-sm text-slate-700">
                Class information will appear here.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Today&apos;s Lectures
              </p>

              <p className="mt-3 text-sm text-slate-700">
                Lecture information will appear here.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Attendance
              </p>

              <p className="mt-3 text-sm text-slate-700">
                Attendance features will appear here.
              </p>
            </div>
          </div>
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