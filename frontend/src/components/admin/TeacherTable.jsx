import TeacherStatusBadge from "./TeacherStatusBadge";

export default function TeacherTable({
  teachers,
  pending = false,
  onApprove,
  onReject,
  processingId,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Table Header */}

      <div className="hidden grid-cols-[1fr_1.2fr_140px_180px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-400 md:grid">
        <span>Teacher</span>
        <span>Email</span>
        <span>Status</span>
        {pending && <span>Actions</span>}
      </div>

      {teachers.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">
            {pending
              ? "No pending teacher approvals."
              : "No teachers found."}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {pending
              ? "All teacher registrations have been reviewed."
              : "There are currently no registered teachers."}
          </p>
        </div>
      ) : (
        <div>
          {teachers.map((teacher) => {
            const isProcessing =
              processingId === teacher.teacher_id;

            return (
              <div
                key={teacher.teacher_id}
                className={`grid gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 ${
                  pending
                    ? "md:grid-cols-[1fr_1.2fr_140px_180px]"
                    : "md:grid-cols-[1fr_1.2fr_140px]"
                } md:items-center`}
              >
                {/* Teacher */}

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {teacher.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Teacher ID: {teacher.teacher_id}
                  </p>
                </div>

                {/* Email */}

                <p className="truncate text-sm text-slate-500">
                  {teacher.email}
                </p>

                {/* Status */}

                <TeacherStatusBadge
                  status={teacher.approval_status}
                />

                {/* Actions */}

                {pending && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        onApprove(teacher.teacher_id)
                      }
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        onReject(teacher.teacher_id)
                      }
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}