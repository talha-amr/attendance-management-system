"use client";

import { useTeacher } from "@/context/TeacherContext";

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

export default function TeacherTimetable() {
  const {
    timetable,
    loading,
    error,
  } = useTeacher();

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading timetable...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100">
        <p className="text-sm text-red-600">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Schedule
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Timetable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your weekly lecture schedule.
          </p>
        </section>

        <div className="mt-8 space-y-4">
          {days.map((day) => {
            const daySchedule = timetable
              .filter(
                (item) =>
                  item.day_of_week?.toUpperCase() === day
              )
              .sort((a, b) =>
                a.start_time.localeCompare(b.start_time)
              );

            return (
              <section
                key={day}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    {day.charAt(0) +
                      day.slice(1).toLowerCase()}
                  </h2>
                </div>

                <div className="p-5">
                  {daySchedule.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No lectures scheduled.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {daySchedule.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.subject_name}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>
                                {item.subject_code}
                              </span>

                              <span>
                                Section {item.section_name}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                              {item.start_time.slice(0, 5)} —{" "}
                              {item.end_time.slice(0, 5)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}