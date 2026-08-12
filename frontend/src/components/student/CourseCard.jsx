export default function CourseCard({ course }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {course.subject_code?.slice(0, 2) || "CO"}
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          {course.section_name}
        </span>
      </div>

      <h3 className="mt-5 line-clamp-2 text-sm font-bold text-slate-900">
        {course.subject_name}
      </h3>

      <p className="mt-1 text-xs font-medium text-slate-400">
        {course.subject_code}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">
          Instructor
        </p>

        <p className="mt-1 truncate text-sm font-medium text-slate-700">
          {course.teacher_name}
        </p>
      </div>
    </div>
  );
}