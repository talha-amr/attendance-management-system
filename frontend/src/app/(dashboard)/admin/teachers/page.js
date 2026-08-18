"use client";

import { useContext, useMemo, useState } from "react";
import { AdminContext } from "@/context/AdminContext";

export default function AdminTeachersPage() {
  const {
    teachers,
    loading,
    actionLoading,
    error,
    refreshTeachers,
    approveTeacher,
    rejectTeacher,
  } = useContext(AdminContext);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        teacher.name?.toLowerCase().includes(searchValue) ||
        teacher.email?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        teacher.approval_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  const pendingCount = teachers.filter(
    (teacher) => teacher.approval_status === "PENDING"
  ).length;

  const approvedCount = teachers.filter(
    (teacher) => teacher.approval_status === "APPROVED"
  ).length;

  const rejectedCount = teachers.filter(
    (teacher) => teacher.approval_status === "REJECTED"
  ).length;

  const handleStatusChange = async (teacherId, newStatus) => {
    try {
      if (newStatus === "APPROVED") {
        await approveTeacher(teacherId);
      }

      if (newStatus === "REJECTED") {
        await rejectTeacher(teacherId);
      }

      // Pending cannot be selected from an approved/rejected teacher
      // because your backend currently has no "set pending" endpoint.
    } catch {
      // AdminContext already stores the error.
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading teachers...
          </p>
        </div>
      </main>
    );
  }

  if (error && teachers.length === 0) {
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
            onClick={refreshTeachers}
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
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Teachers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage teacher accounts and their approval status.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-400">
              Total Teachers
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {teachers.length}
            </p>
          </div>
        </section>

        {/* Stats */}

        <section className="grid gap-4 sm:grid-cols-3">
          <TeacherStat
            label="Pending"
            value={pendingCount}
            description="Awaiting review"
          />

          <TeacherStat
            label="Approved"
            value={approvedCount}
            description="Currently approved"
          />

          <TeacherStat
            label="Rejected"
            value={rejectedCount}
            description="Currently rejected"
          />
        </section>

        {/* Filters */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </section>

        {/* Error after an action */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Teacher Table */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Teachers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredTeachers.length} teacher
                {filteredTeachers.length !== 1 ? "s" : ""} found.
              </p>
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-slate-500">
                No teachers found.
              </p>

              {(search || statusFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div>

              {/* Desktop headings */}

              <div className="hidden grid-cols-[1.5fr_1.7fr_1fr_180px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
                <span>Teacher</span>
                <span>Email</span>
                <span>Created</span>
                <span>Status</span>
              </div>

              {/* Rows */}

              {filteredTeachers.map((teacher) => (
                <TeacherRow
                  key={teacher.teacher_id}
                  teacher={teacher}
                  actionLoading={actionLoading}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


/* -------------------------------- */
/* Teacher Row */
/* -------------------------------- */

function TeacherRow({
  teacher,
  actionLoading,
  onStatusChange,
}) {
  const createdDate = teacher.created_at
    ? new Date(teacher.created_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )
    : "—";

  return (
    <div className="border-b border-slate-100 px-6 py-5 last:border-b-0">

      {/* Desktop */}

      <div className="hidden grid-cols-[1.5fr_1.7fr_1fr_180px] items-center gap-4 md:grid">

        {/* Teacher */}

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
            {teacher.name?.charAt(0)?.toUpperCase() || "T"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {teacher.name}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Teacher ID: {teacher.teacher_id}
            </p>
          </div>
        </div>

        {/* Email */}

        <p className="truncate text-sm text-slate-500">
          {teacher.email}
        </p>

        {/* Created */}

        <p className="text-sm text-slate-500">
          {createdDate}
        </p>

        {/* Status */}

        <TeacherStatusSelect
          status={teacher.approval_status}
          disabled={actionLoading}
          onChange={(value) =>
            onStatusChange(teacher.teacher_id, value)
          }
        />
      </div>

      {/* Mobile */}

      <div className="space-y-4 md:hidden">

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
            {teacher.name?.charAt(0)?.toUpperCase() || "T"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {teacher.name}
            </p>

            <p className="mt-1 break-all text-xs text-slate-500">
              {teacher.email}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Created {createdDate}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Approval Status
          </p>

          <TeacherStatusSelect
            status={teacher.approval_status}
            disabled={actionLoading}
            onChange={(value) =>
              onStatusChange(teacher.teacher_id, value)
            }
          />
        </div>
      </div>
    </div>
  );
}


/* -------------------------------- */
/* Status Select */
/* -------------------------------- */

function TeacherStatusSelect({
  status,
  disabled,
  onChange,
}) {
  return (
    <div className="relative">
      <select
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-xs font-bold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
          status === "APPROVED"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            : status === "REJECTED"
            ? "border-red-200 bg-red-50 text-red-700 focus:border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
        }`}
      >
        {status === "PENDING" && (
          <option value="PENDING">
            Pending
          </option>
        )}

        <option value="APPROVED">
          Approved
        </option>

        <option value="REJECTED">
          Rejected
        </option>
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-current">
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 1.04l-4.25-4.51a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* Stat */
/* -------------------------------- */

function TeacherStat({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}