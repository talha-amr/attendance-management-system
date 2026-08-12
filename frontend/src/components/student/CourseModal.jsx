"use client";

export default function CourseModal({ open, courses, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Courses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All courses you are currently enrolled in.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.course_section_id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {course.subject_name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {course.subject_code}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
                    Section {course.section_name}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-slate-400">Teacher</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {course.teacher_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Semester</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {course.semester}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Academic Year</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {course.academic_year}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}