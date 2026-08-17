"use client";

export default function TeacherCourseCard({
  course,
  onClick,
}) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {course.subject_code}
          </p>

          <h2 className="mt-2 text-lg font-bold text-slate-900">
            {course.subject_name}
          </h2>
        </div>

        <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Section {course.section_name}
        </span>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <CourseDetail
          label="Semester"
          value={course.semester}
        />

        <CourseDetail
          label="Academic Year"
          value={course.academic_year}
        />
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        View Students
      </button>
    </article>
  );
}

function CourseDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}