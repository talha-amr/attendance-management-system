"use client";

import { useEffect, useState } from "react";

export default function AttendanceModal({
  open,
  course,
  students,
  onClose,
  onSuccess,
}) {
  const [date, setDate] = useState("");
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !students.length) {
      return;
    }

    const initialStatuses = {};

    students.forEach((student) => {
      initialStatuses[student.student_id] = "present";
    });

    setStatuses(initialStatuses);

    const today = new Date()
      .toISOString()
      .split("T")[0];

    setDate(today);
    setError("");
  }, [open, students]);

  if (!open || !course) {
    return null;
  }

  function changeStatus(studentId, status) {
    setStatuses((current) => ({
      ...current,
      [studentId]: status,
    }));
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not authenticated.");
      }

      /*
       * Backend accepts one attendance record
       * per POST request.
       *
       * Therefore we send one request for each
       * student.
       */

      for (const student of students) {
        const response = await fetch(
          "http://127.0.0.1:8000/teachers/attendance",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              course_section_id:
                course.course_section_id,

              student_id:
                student.student_id,

              date,

              status:
                statuses[student.student_id] ||
                "present",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              `Failed to mark attendance for ${student.name}`
          );
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.message ||
          "Unable to mark attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {course.subject_code}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Mark Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {course.subject_name} — Section{" "}
              {course.section_name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-6">

          {/* Date */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Attendance Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Students */}
          <div className="mt-6 space-y-3">
            {students.map((student) => {
              const status =
                statuses[student.student_id] ||
                "present";

              return (
                <div
                  key={student.student_id}
                  className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {student.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {student.email}
                    </p>
                  </div>

                  <div className="flex gap-2">

                    {/* Present */}
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          student.student_id,
                          "present"
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        status === "present"
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      Present
                    </button>

                    {/* Absent */}
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          student.student_id,
                          "absent"
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        status === "absent"
                          ? "bg-red-600 text-white"
                          : "bg-white text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      Absent
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !students.length}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving Attendance..."
              : "Save Attendance"}
          </button>
        </div>

      </div>
    </div>
  );
}

