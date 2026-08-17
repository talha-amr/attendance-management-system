"use client";

export default function TeacherStudentList({
  students,
  loading,
  error,
  course,
  onClose,
}) {
  if (!course) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {course.subject_code}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {course.subject_name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Section {course.section_name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {loading && (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading students...
            </p>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            students.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No students are enrolled in this course.
              </p>
            )}

          {!loading && !error && students.length > 0 && (
            <div className="divide-y divide-slate-100">
              {students.map((student) => (
                <div
                  key={student.student_id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {student.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {student.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Student #{student.student_id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}