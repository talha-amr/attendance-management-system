"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const navLinks = {
  student: [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "My Courses", href: "/student/courses" },
    { label: "Enroll", href: "/student/enroll" },
    { label: "Timetable", href: "/student/timetable" },
    { label: "Attendance", href: "/student/attendance" },
  ],

  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "Courses", href: "/teacher/courses" },
    { label: "Timetable", href: "/teacher/timetable" },
    { label: "Attendance", href: "/teacher/attendance" },
  ],

  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Courses", href: "/admin/courses" },
    { label: "Enrollments", href: "/admin/enrollments" },
    { label: "Timetable", href: "/admin/timetable" },
    { label: "Attendance", href: "/admin/attendance" },
  ],
};

export default function Navbar({ role }) {
  const { user, loading, logout } = useContext(AuthContext);

  const links = navLinks[role] || [];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        <Link href={`/${role}/dashboard`}>
          <h1 className="text-xl font-bold text-slate-900">
            School Attendance
          </h1>

          <p className="text-xs text-slate-500">
            Attendance Tracking System
          </p>
        </Link>

        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}

          {loading ? (
            <p className="text-sm text-slate-500">
              Loading...
            </p>
          ) : (
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-6 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>

                <p className="text-xs text-slate-500">
                  {user?.role || "Role"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}