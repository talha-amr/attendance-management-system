import { useState } from "react";

export default function PendingTeachers({
  teachers,
  onApprove,
  onReject,
  actionLoading,
}) {
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (teacherId) => {
    try {
      setProcessingId(teacherId);
      await onApprove(teacherId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (teacherId) => {
    try {
      setProcessingId(teacherId);
      await onReject(teacherId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Teacher Management
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Pending Approvals
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review teachers waiting for approval.
          </p>
        </div>

        <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
          {teachers.length} pending
        </span>
      </div>

      {teachers.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            No pending teacher approvals.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            All teacher registrations have been reviewed.
          </p>
        </div>
      ) : (
        <div>
          <div className="hidden grid-cols-[1fr_1fr_140px_180px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-400 md:grid">
            <span>Name</span>
            <span>Email</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {teachers.map((teacher) => {
            const processing =
              actionLoading && processingId === teacher.teacher_id;

            return (
              <div
                key={teacher.teacher_id}
                className="grid gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 md:grid-cols-[1fr_1fr_140px_180px] md:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {teacher.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 md:hidden">
                    {teacher.email}
                  </p>
                </div>

                <p className="hidden truncate text-sm text-slate-500 md:block">
                  {teacher.email}
                </p>

                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase text-amber-600">
                  {teacher.approval_status}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={processing}
                    onClick={() =>
                      handleApprove(teacher.teacher_id)
                    }
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Approve"}
                  </button>

                  <button
                    disabled={processing}
                    onClick={() =>
                      handleReject(teacher.teacher_id)
                    }
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}