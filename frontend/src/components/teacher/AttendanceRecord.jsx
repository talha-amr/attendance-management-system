"use client";

export default function AttendanceRecord({
  record,
  onUpdate,
  updating,
}) {
  const isPresent =
    record.status?.toLowerCase() === "present";

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

      <button
        type="button"
        disabled={updating}
        onClick={() =>
          onUpdate(
            record.id,
            isPresent
              ? "absent"
              : "present"
          )
        }
        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
          isPresent
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "bg-red-50 text-red-700 hover:bg-red-100"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {updating
          ? "Updating..."
          : record.status}
      </button>
    </div>
  );
}