"use client";

export default function AttendanceRecord({
  record,
  studentName,
  onUpdate,
  updating,
}) {
  const isPresent =
    record.status === "PRESENT";

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {studentName ||
            `Student #${record.student_id}`}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {record.date}
        </p>
      </div>

      <button
        type="button"
        disabled={updating}
        onClick={() =>
          onUpdate(
            record.id,
            isPresent ? "ABSENT" : "PRESENT"
          )
        }
        className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
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