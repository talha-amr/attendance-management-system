"use client";

export default function AttendanceModal({
  open,
  attendance,
  sectionMap,
  onClose,
}) {
  if (!open) return null;

  const sortedAttendance = [...attendance].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete attendance history across your courses.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          <div className="hidden grid-cols-[1fr_140px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-400 sm:grid">
            <span>Course</span>
            <span>Date</span>
            <span>Status</span>
          </div>

          {sortedAttendance.map((record) => {
            const course = sectionMap[record.course_section_id];

            const isPresent = record.status === "PRESENT";

            return (
              <div
                key={record.id}
                className="grid gap-2 border-b border-slate-100 px-6 py-4 sm:grid-cols-[1fr_140px_110px] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {course?.subject_name || "Unknown Course"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {course?.subject_code || "—"}
                  </p>
                </div>

                <p className="text-xs font-medium text-slate-500">
                  {new Date(record.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold ${
                    isPresent
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {record.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}