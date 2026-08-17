
"use client";

import { useContext } from "react";
import { StudentContext } from "@/context/StudentContext";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export default function StudentTimetable() {
  const {
    timetable,
    loading,
    error,
    refreshStudentData,
  } = useContext(StudentContext);

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
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={refreshStudentData}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Schedule
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Weekly Timetable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your complete weekly lecture schedule.
          </p>
        </section>

        {/* Weekly Schedule */}

        <div className="mt-8 space-y-4">
          {days.map((day) => {
            const daySchedule = timetable
              .filter(
                (item) =>
                  item.day_of_week?.toLowerCase() === day
              )
              .sort((a, b) =>
                a.start_time.localeCompare(
                  b.start_time
                )
              );

            return (
              <section
                key={day}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Day Header */}

                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    {day.charAt(0).toUpperCase() +
                      day.slice(1)}
                  </h2>
                </div>

                {/* Day Schedule */}

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
                          {/* Course Information */}

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.subject_name ||
                                "Unknown Course"}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                              {item.subject_code && (
                                <span>
                                  {item.subject_code}
                                </span>
                              )}

                              {item.section_name && (
                                <>
                                  <span>•</span>

                                  <span>
                                    Section{" "}
                                    {item.section_name}
                                  </span>
                                </>
                              )}

                              {item.teacher_name && (
                                <>
                                  <span>•</span>

                                  <span>
                                    {item.teacher_name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Time */}

                          <div className="shrink-0">
                            <p className="text-sm font-semibold text-indigo-600">
                              {item.start_time.slice(0, 5)}
                              {" — "}
                              {item.end_time.slice(0, 5)}
                            </p>
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
