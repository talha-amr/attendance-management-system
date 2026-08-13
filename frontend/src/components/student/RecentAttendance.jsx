export default function RecentAttendance({
  attendance,
  sectionMap,
  onViewAll,
}) {
  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Attendance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest attendance records.
          </p>
        </div>

        {attendance.length > 5 && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            View all
          </button>
        )}
      </div>

      {recentAttendance.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-slate-500">
            No attendance records available.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recentAttendance.map((record) => {
            const course = sectionMap[record.course_section_id];

            const isPresent = record.status === "present";

            return (
              <div
                key={record.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {course?.subject_name || "Unknown Course"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(record.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${
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
      )}
    </section>
  );
}