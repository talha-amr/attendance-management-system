"use client";

export default function AttendanceRecord({
  record,
  onUpdate,
  updating,
}) {
  const isPresent =
    record.status?.toLowerCase() === "present";

  /*
   * Backend rule:
   *
   * Attendance can be updated when:
   *
   * attendance.date >= today - 7 days
   *
   * So exactly 7 days ago is still allowed.
   */

  const isOlderThanSevenDays = (attendanceDate) => {
    const today = new Date();
    const date = new Date(
      `${attendanceDate}T00:00:00`
    );

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const difference =
      (today - date) / (1000 * 60 * 60 * 24);

    return difference > 7;
  };

  const isOld = isOlderThanSevenDays(record.date);

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
          {record.student_name ||
            `Student #${record.student_id}`}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {record.student_email}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {record.subject_code} —{" "}
          {record.section_name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {record.date}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
        <button
          type="button"
          disabled={updating || isOld}
          onClick={() =>
            onUpdate(
              record.id,
              isPresent
                ? "absent"
                : "present"
            )
          }
          title={
            isOld
              ? "Attendance can only be updated within 7 days"
              : ""
          }
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            isPresent
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          } ${
            isOld
              ? "cursor-not-allowed opacity-50"
              : ""
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {updating
            ? "Updating..."
            : record.status}
        </button>

        {isOld && (
          <p className="text-xs text-slate-400">
            Locked after 7 days
          </p>
        )}
      </div>
    </div>
  );
}