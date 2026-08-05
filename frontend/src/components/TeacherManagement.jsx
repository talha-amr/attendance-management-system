"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeacherRow from "./TeacherRow";

export default function TeacherManagement() {
  const router = useRouter();

  const [teachers, setTeachers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          router.replace("/auth");
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/admin/teachers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          router.replace("/auth");
          return;
        }

        if (response.status === 403) {
          setError(data.detail || "Admin access required.");
          return;
        }

        if (!response.ok) {
          setError(data.detail || "Could not load teachers.");
          return;
        }

        const normalizedTeachers = data.map((teacher) => ({
          ...teacher,
          approval_status: teacher.approval_status.toUpperCase(),
        }));

        setTeachers(normalizedTeachers);
      } catch {
        setError("Could not load teachers.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [router]);

  const handleStatusChange = async (teacherId, newStatus) => {
    try {
      setProcessingId(teacherId);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      let action;

      if (newStatus === "APPROVED") {
        action = "approve";
      } else if (newStatus === "REJECTED") {
        action = "reject";
      } else {
        setError("Invalid teacher status.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/admin/teachers/${teacherId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/auth");
        return;
      }

      if (response.status === 403) {
        setError(data.detail || "Admin access required.");
        return;
      }

      if (!response.ok) {
        setError(data.detail || "Could not update teacher status.");
        return;
      }

      setTeachers((currentTeachers) =>
        currentTeachers.map((teacher) =>
          teacher.id === teacherId
            ? {
                ...teacher,
                approval_status: newStatus,
              }
            : teacher
        )
      );
    } catch {
      setError("Could not update teacher status.");
    } finally {
      setProcessingId(null);
    }
  };

  const approvedTeachers = teachers.filter(
    (teacher) => teacher.approval_status === "APPROVED"
  );

  const pendingTeachers = teachers.filter(
    (teacher) => teacher.approval_status === "PENDING"
  );

  const rejectedTeachers = teachers.filter(
    (teacher) => teacher.approval_status === "REJECTED"
  );

  const filteredTeachers =
    activeFilter === "ALL"
      ? teachers
      : teachers.filter(
          (teacher) => teacher.approval_status === activeFilter
        );

  const filters = [
    {
      label: "All",
      value: "ALL",
      count: teachers.length,
    },
    {
      label: "Pending",
      value: "PENDING",
      count: pendingTeachers.length,
    },
    {
      label: "Approved",
      value: "APPROVED",
      count: approvedTeachers.length,
    },
    {
      label: "Rejected",
      value: "REJECTED",
      count: rejectedTeachers.length,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">Loading teachers...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Teacher Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review teacher registrations and manage their approval status.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Teachers
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {teachers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-green-700">
            Approved
          </p>

          <p className="mt-2 text-3xl font-bold text-green-900">
            {approvedTeachers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">
            Pending Approval
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-900">
            {pendingTeachers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">
            Rejected
          </p>

          <p className="mt-2 text-3xl font-bold text-red-900">
            {rejectedTeachers.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Teachers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Filter and manage registered teachers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-slate-500">
              No teachers found for this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Teacher</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Registered</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Change Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => (
                  <TeacherRow
                    key={teacher.id}
                    teacher={teacher}
                    onStatusChange={handleStatusChange}
                    processing={processingId === teacher.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}