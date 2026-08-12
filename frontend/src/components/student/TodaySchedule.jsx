export default function TodaySchedule({ schedule, sectionMap }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Today&apos;s Schedule
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your lectures scheduled for today.
          </p>
        </div>

        <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
          Today
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-500">
            No lectures scheduled for today.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {schedule.map((lecture) => {
            const course = sectionMap[lecture.course_section_id];

            return (
              <div
                key={lecture.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="w-20 shrink-0">
                  <p className="text-sm font-bold text-slate-900">
                    {lecture.start_time}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {lecture.end_time}
                  </p>
                </div>

                <div className="h-10 w-px bg-slate-200" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {course?.subject_name || "Unknown Course"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {course?.subject_code || "—"} · Section{" "}
                    {course?.section_name || "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}